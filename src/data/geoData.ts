import { GeoCountry } from '../types';

/**
 * Facebook Meta Graph API Division / Region Keys
 * Bangladesh divisions and Indian states with exact Meta Geo Targeting Region IDs
 */
export const INITIAL_GEO_COUNTRIES: GeoCountry[] = [
  {
    code: 'BD',
    name: 'Bangladesh',
    isSelected: false, // PARENT COUNTRY UNTICKED (Meta state-only targeting)
    isExpanded: true,
    states: [
      { key: '4373', name: 'Dhaka Division', code: '4373', isSelected: true },
      { key: '4372', name: 'Chattogram Division', code: '4372', isSelected: true },
      { key: '4375', name: 'Rajshahi Division', code: '4375', isSelected: true },
      { key: '4374', name: 'Khulna Division', code: '4374', isSelected: true },
      { key: '4371', name: 'Barisal Division', code: '4371', isSelected: true },
      { key: '4377', name: 'Sylhet Division', code: '4377', isSelected: true },
      { key: '4376', name: 'Rangpur Division', code: '4376', isSelected: true },
      { key: '4378', name: 'Mymensingh Division', code: '4378', isSelected: true },
    ],
  },
  {
    code: 'IN',
    name: 'India',
    isSelected: false, // PARENT COUNTRY UNTICKED (Meta state-only targeting)
    isExpanded: true,
    states: [
      { key: '1781', name: 'West Bengal', code: 'WB', isSelected: true },
      { key: '1756', name: 'Goa', code: 'GA', isSelected: true },
      { key: '1724', name: 'Andhra Pradesh', code: 'AP', isSelected: true },
      { key: '1769', name: 'Mizoram', code: 'MZ', isSelected: true },
      { key: '1778', name: 'Tripura', code: 'TR', isSelected: true },
      { key: '1749', name: 'Assam', code: 'AS', isSelected: true },
      { key: '1767', name: 'Manipur', code: 'MN', isSelected: true },
      { key: '1759', name: 'Himachal Pradesh', code: 'HP', isSelected: true },
      { key: '1748', name: 'Arunachal Pradesh', code: 'AR', isSelected: true },
      { key: '1761', name: 'Jharkhand', code: 'JH', isSelected: true },
      { key: '1765', name: 'Madhya Pradesh', code: 'MP', isSelected: true },
      { key: '1771', name: 'Odisha', code: 'OR', isSelected: true },
      { key: '1770', name: 'Nagaland', code: 'NL', isSelected: true },
      { key: '1768', name: 'Meghalaya', code: 'ML', isSelected: true },
      { key: '1780', name: 'Uttarakhand', code: 'UT', isSelected: true },
      { key: '1775', name: 'Sikkim', code: 'SK', isSelected: true },
      { key: '1760', name: 'Jammu & Kashmir', code: 'JK', isSelected: true },
      { key: '1750', name: 'Bihar', code: 'BR', isSelected: false },
      { key: '1755', name: 'Delhi', code: 'DL', isSelected: false },
      { key: '1757', name: 'Gujarat', code: 'GJ', isSelected: false },
      { key: '1762', name: 'Karnataka', code: 'KA', isSelected: false },
      { key: '1763', name: 'Kerala', code: 'KL', isSelected: false },
      { key: '1766', name: 'Maharashtra', code: 'MH', isSelected: false },
      { key: '1773', name: 'Punjab', code: 'PB', isSelected: false },
      { key: '1774', name: 'Rajasthan', code: 'RJ', isSelected: false },
      { key: '1776', name: 'Tamil Nadu', code: 'TN', isSelected: false },
      { key: '1777', name: 'Telangana', code: 'TG', isSelected: false },
      { key: '1779', name: 'Uttar Pradesh', code: 'UP', isSelected: false },
    ],
  },
  {
    code: 'EG',
    name: 'Egypt',
    isSelected: false,
    isExpanded: false,
    states: [
      { key: 'eg_cairo', name: 'Cairo Governorate', code: 'C', isSelected: false },
      { key: 'eg_alex', name: 'Alexandria', code: 'ALX', isSelected: false },
      { key: 'eg_giza', name: 'Giza', code: 'GZ', isSelected: false },
      { key: 'eg_port_said', name: 'Port Said', code: 'PTS', isSelected: false },
      { key: 'eg_suez', name: 'Suez', code: 'SUZ', isSelected: false },
    ],
  },
  {
    code: 'PK',
    name: 'Pakistan',
    isSelected: false,
    isExpanded: false,
    states: [
      { key: 'pk_pb', name: 'Punjab', code: 'PB', isSelected: false },
      { key: 'pk_sd', name: 'Sindh', code: 'SD', isSelected: false },
      { key: 'pk_kp', name: 'Khyber Pakhtunkhwa', code: 'KP', isSelected: false },
      { key: 'pk_ba', name: 'Balochistan', code: 'BA', isSelected: false },
      { key: 'pk_is', name: 'Islamabad Capital', code: 'IS', isSelected: false },
    ],
  },
  {
    code: 'NP',
    name: 'Nepal',
    isSelected: false,
    isExpanded: false,
    states: [
      { key: 'np_bagmati', name: 'Bagmati Province', code: 'BAG', isSelected: false },
      { key: 'np_gandaki', name: 'Gandaki Province', code: 'GAN', isSelected: false },
      { key: 'np_lumbini', name: 'Lumbini Province', code: 'LUM', isSelected: false },
      { key: 'np_koshi', name: 'Koshi Province', code: 'KOS', isSelected: false },
    ],
  },
  {
    code: 'DK',
    name: 'Denmark',
    isSelected: false,
    isExpanded: false,
    states: [
      { key: 'dk_capital', name: 'Capital Region (Hovedstaden)', code: '84', isSelected: false },
      { key: 'dk_central', name: 'Central Denmark (Midtjylland)', code: '82', isSelected: false },
      { key: 'dk_south', name: 'Region of Southern Denmark', code: '83', isSelected: false },
      { key: 'dk_zealand', name: 'Zealand (Sjælland)', code: '85', isSelected: false },
    ],
  },
  {
    code: 'NZ',
    name: 'New Zealand',
    isSelected: false,
    isExpanded: false,
    states: [
      { key: 'nz_auckland', name: 'Auckland', code: 'AUK', isSelected: false },
      { key: 'nz_wellington', name: 'Wellington', code: 'WGN', isSelected: false },
      { key: 'nz_canterbury', name: 'Canterbury', code: 'CAN', isSelected: false },
      { key: 'nz_waikato', name: 'Waikato', code: 'WKO', isSelected: false },
    ],
  },
  {
    code: 'BR',
    name: 'Brazil',
    isSelected: false,
    isExpanded: false,
    states: [
      { key: 'br_sp', name: 'São Paulo', code: 'SP', isSelected: false },
      { key: 'br_rj', name: 'Rio de Janeiro', code: 'RJ', isSelected: false },
      { key: 'br_mg', name: 'Minas Gerais', code: 'MG', isSelected: false },
      { key: 'br_ba', name: 'Bahia', code: 'BA', isSelected: false },
    ],
  },
  {
    code: 'US',
    name: 'United States',
    isSelected: false,
    isExpanded: false,
    states: [
      { key: 'us_ca', name: 'California', code: 'CA', isSelected: false },
      { key: 'us_tx', name: 'Texas', code: 'TX', isSelected: false },
      { key: 'us_fl', name: 'Florida', code: 'FL', isSelected: false },
      { key: 'us_ny', name: 'New York', code: 'NY', isSelected: false },
      { key: 'us_il', name: 'Illinois', code: 'IL', isSelected: false },
    ],
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    isSelected: false,
    isExpanded: false,
    states: [
      { key: 'sa_riyadh', name: 'Riyadh', code: '01', isSelected: false },
      { key: 'sa_makkah', name: 'Makkah Region', code: '02', isSelected: false },
      { key: 'sa_eastern', name: 'Eastern Province', code: '04', isSelected: false },
    ],
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    isSelected: false,
    isExpanded: false,
    states: [
      { key: 'ae_dubai', name: 'Dubai', code: 'DU', isSelected: false },
      { key: 'ae_abudhabi', name: 'Abu Dhabi', code: 'AZ', isSelected: false },
      { key: 'ae_sharjah', name: 'Sharjah', code: 'SH', isSelected: false },
    ],
  },
];

/**
 * The user's exact customized list of target states & divisions
 * (Dhaka + Bangladesh Divisions & specific Indian states)
 */
export const USER_CUSTOM_STATE_KEYS = [
  '4373', // Dhaka Division
  '4372', // Chattogram Division
  '4375', // Rajshahi Division
  '4374', // Khulna Division
  '4371', // Barisal Division
  '4377', // Sylhet Division
  '4376', // Rangpur Division
  '4378', // Mymensingh Division
  '1781', // West Bengal, India
  '1756', // Goa, India
  '1724', // Andhra Pradesh, India
  '1769', // Mizoram, India
  '1778', // Tripura, India
  '1749', // Assam, India
  '1767', // Manipur, India
  '1759', // Himachal Pradesh, India
  '1748', // Arunachal Pradesh, India
  '1761', // Jharkhand, India
  '1765', // Madhya Pradesh, India
  '1771', // Odisha, India
  '1770', // Nagaland, India
  '1768', // Meghalaya, India
  '1780', // Uttarakhand, India
  '1775', // Sikkim, India
  '1760', // Jammu & Kashmir, India
];

