import { FacebookPage, UserProfile, MediaItem } from '../types';

export const FB_GRAPH_VERSION = 'v20.0';
export const FB_GRAPH_BASE = `https://graph.facebook.com/${FB_GRAPH_VERSION}`;
export const FB_VIDEO_BASE = `https://graph-video.facebook.com/${FB_GRAPH_VERSION}`;

/**
 * Validates user access token and fetches user profile details.
 */
export async function fetchFacebookUserProfile(token: string): Promise<UserProfile> {
  try {
    const res = await fetch(
      `${FB_GRAPH_BASE}/me?fields=id,name,picture.width(150),email&access_token=${encodeURIComponent(token)}`
    );
    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`Facebook server error (HTTP ${res.status}): ${text.slice(0, 100)}`);
    }

    if (!res.ok || data.error) {
      throw new Error(data.error?.message || 'Facebook Token Validation Failed');
    }

    return {
      id: data.id,
      name: data.name,
      avatarUrl: data.picture?.data?.url || '',
      email: data.email,
      connectedAt: new Date().toLocaleTimeString(),
      userToken: token,
      isValidated: true,
    };
  } catch (err: any) {
    throw new Error(err.message || 'Network error connecting to Facebook API');
  }
}

/**
 * Fetches all real Facebook Pages associated with the user token.
 */
export async function fetchFacebookPages(token: string): Promise<FacebookPage[]> {
  try {
    const res = await fetch(
      `${FB_GRAPH_BASE}/me/accounts?fields=id,name,followers_count,fan_count,access_token,category,picture.width(100)&limit=100&access_token=${encodeURIComponent(token)}`
    );
    const text = await res.text();
    let data: any;
    try {
      data = JSON.parse(text);
    } catch (e) {
      throw new Error(`Facebook server error (HTTP ${res.status}): ${text.slice(0, 100)}`);
    }

    if (!res.ok || data.error) {
      throw new Error(data.error?.message || 'Failed to fetch Facebook Pages');
    }

    if (!data.data || !Array.isArray(data.data)) {
      return [];
    }

    return data.data.map((item: any, idx: number) => ({
      id: item.id,
      name: item.name,
      followers: item.followers_count || item.fan_count || 0,
      category: item.category || 'Facebook Page',
      isSelected: idx === 0,
      accessToken: item.access_token,
      avatarUrl: item.picture?.data?.url || `https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=100&auto=format&fit=crop&q=80`,
      verified: false,
    }));
  } catch (err: any) {
    throw new Error(err.message || 'Could not fetch pages from Facebook Graph API');
  }
}

export interface PublishMediaParams {
  page: FacebookPage;
  media: MediaItem;
  postType: 'Post' | 'Reels' | 'Video' | 'Story';
  geoTargeting?: {
    countries: string[];
    regions: { key: string; name: string }[];
  };
  fastUpload?: boolean;
  scheduleTime?: string;
  autoComment?: string;
}

/**
 * Direct client-side video upload to Facebook Graph Video API.
 * Uses XMLHttpRequest to bypass Cloud Run payload size limits and track real byte upload progress.
 */
function uploadDirectlyToMeta(
  pageId: string,
  accessToken: string,
  file: File,
  caption: string,
  title: string,
  targetingPayload?: any,
  scheduleTime?: string,
  onProgress?: (pct: number) => void
): Promise<{ id: string; postUrl: string }> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('access_token', accessToken);
    formData.append('source', file);
    if (caption) {
      formData.append('description', caption);
    }
    if (title) {
      formData.append('title', title);
    }

    if (scheduleTime) {
      const scheduleUnix = Math.floor(new Date(scheduleTime).getTime() / 1000);
      if (scheduleUnix > Math.floor(Date.now() / 1000) + 600) {
        formData.append('published', 'false');
        formData.append('scheduled_publish_time', scheduleUnix.toString());
      }
    } else {
      formData.append('published', 'true');
    }

    if (targetingPayload) {
      formData.append('targeting', JSON.stringify(targetingPayload));
    }

    const xhr = new XMLHttpRequest();
    const endpoint = `${FB_VIDEO_BASE}/${encodeURIComponent(pageId)}/videos`;
    xhr.open('POST', endpoint, true);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && event.total > 0) {
          const pct = Math.round((event.loaded / event.total) * 100);
          onProgress(Math.min(99, Math.max(5, pct)));
        }
      };
    }

    xhr.onload = () => {
      let data: any = {};
      try {
        data = JSON.parse(xhr.responseText || '{}');
      } catch (e) {
        return reject(new Error(`Facebook returned invalid response: ${xhr.status} ${xhr.responseText?.slice(0, 100)}`));
      }

      if (xhr.status >= 200 && xhr.status < 300 && data.id) {
        onProgress?.(100);
        return resolve({
          id: data.id,
          postUrl: `https://www.facebook.com/${pageId}/videos/${data.id}`,
        });
      }

      // Meta Error format handling
      const fbError = data?.error;
      let detailedMsg = fbError?.message || `Facebook rejected upload (HTTP ${xhr.status})`;
      if (fbError?.code === 190) {
        detailedMsg = 'Facebook Access Token expired. Please refresh your token in settings.';
      } else if (fbError?.code === 200 || fbError?.code === 10) {
        detailedMsg = 'Permission denied by Facebook. Ensure the token has "pages_manage_posts" and "publish_video" permissions.';
      }

      return reject(new Error(detailedMsg));
    };

    xhr.onerror = () => {
      reject(new Error('Network error connecting directly to Facebook. Retrying through proxy...'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Facebook upload timed out. Please check your internet connection.'));
    };

    xhr.send(formData);
  });
}

/**
 * Fallback proxy upload if direct upload encounters CORS or network issues.
 */
async function uploadViaServerProxy(
  pageId: string,
  accessToken: string,
  file: File,
  caption: string,
  title: string,
  postType: string,
  targetingPayload?: any,
  onProgress?: (pct: number) => void
): Promise<{ id: string; postUrl: string }> {
  onProgress?.(30);
  const formData = new FormData();
  formData.append('video', file);
  formData.append('page_id', pageId);
  formData.append('access_token', accessToken);
  formData.append('description', caption || '');
  formData.append('title', title || 'Video');
  formData.append('post_type', postType);

  if (targetingPayload) {
    formData.append('targeting', JSON.stringify(targetingPayload));
  }

  onProgress?.(50);
  const res = await fetch('/api/facebook/upload-video', {
    method: 'POST',
    body: formData,
  });

  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch (e) {
    if (text.includes('413') || text.includes('Request Entity Too Large')) {
      throw new Error('File is too large for the proxy server. Please ensure you are connected to the internet to upload directly to Facebook.');
    }
    throw new Error(`Server returned unexpected error (${res.status}): ${text.slice(0, 100)}`);
  }

  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Server proxy rejected upload');
  }

  onProgress?.(100);
  return {
    id: data.id,
    postUrl: data.postUrl || `https://www.facebook.com/${pageId}/videos/${data.id}`,
  };
}

/**
 * Publishes a video to Facebook with full error handling, real-time progress, and auto-fallback.
 */
export async function publishVideoToPage(
  params: PublishMediaParams,
  onProgress: (pct: number) => void
): Promise<{ success: boolean; postId: string; postUrl: string; details?: string }> {
  const tokenToUse = params.page.accessToken || '';
  const isRealToken = Boolean(
    tokenToUse &&
    tokenToUse.length > 25 &&
    !tokenToUse.includes('VALID_DEMO_SYSTEM_TOKEN')
  );

  if (!isRealToken) {
    throw new Error('No valid Facebook Page Token found. Please connect your Facebook account in settings.');
  }

  if (!params.media.file) {
    throw new Error(`No file found for "${params.media.name}". Please select video files using SELECT MEDIA.`);
  }

  // Build Meta targeting structure
  const geoLocations: Record<string, any> = {};
  if (params.geoTargeting) {
    if (params.geoTargeting.countries && params.geoTargeting.countries.length > 0) {
      geoLocations.countries = params.geoTargeting.countries;
    }
    if (params.geoTargeting.regions && params.geoTargeting.regions.length > 0) {
      geoLocations.regions = params.geoTargeting.regions.map((r) => ({ key: r.key }));
    }
  }
  const targetingPayload = Object.keys(geoLocations).length > 0 ? { geo_locations: geoLocations } : undefined;

  const title = params.media.name.replace(/\.[^/.]+$/, '') || 'Video';
  const caption = params.media.caption || '';

  onProgress(5);

  try {
    // 1. Primary Strategy: Direct Client Upload to Facebook (no proxy limit, fast, real byte progress)
    const result = await uploadDirectlyToMeta(
      params.page.id,
      tokenToUse,
      params.media.file,
      caption,
      title,
      targetingPayload,
      params.scheduleTime,
      onProgress
    );

    return {
      success: true,
      postId: result.id,
      postUrl: result.postUrl,
      details: `Successfully published to "${params.page.name}"!`,
    };
  } catch (directErr: any) {
    console.warn('Direct Facebook upload failed, attempting server proxy fallback...', directErr);
    
    // If it was an explicit token permission error from Facebook, do NOT re-run through proxy because it will fail identically
    if (directErr.message.includes('Permission denied') || directErr.message.includes('Access Token expired')) {
      throw directErr;
    }

    // 2. Secondary Strategy: Proxy through server
    try {
      const fallbackResult = await uploadViaServerProxy(
        params.page.id,
        tokenToUse,
        params.media.file,
        caption,
        title,
        params.postType,
        targetingPayload,
        onProgress
      );

      return {
        success: true,
        postId: fallbackResult.id,
        postUrl: fallbackResult.postUrl,
        details: `Published via proxy to "${params.page.name}"!`,
      };
    } catch (proxyErr: any) {
      throw new Error(`Facebook Upload Error: ${directErr.message || proxyErr.message}`);
    }
  }
}
