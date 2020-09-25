export const RELATED_INTENSIVE = 'intensive';
export const RELATED_POINT = 'point';

export const RELATED_TIME_10S = { value: '10', name: '10 sec' };
export const RELATED_TIME_1M = { value: '60', name: '1 min' };
export const RELATED_TIME_1H = { value: '3600', name: '1 hour' };
export const RELATED_TIME_1D = { value: '86400', name: '1 day' };
export const RELATED_TIME_1W = { value: '604800', name: '1 week' };

export const RELATED_TIMES = [RELATED_TIME_10S, RELATED_TIME_1M, RELATED_TIME_1H, RELATED_TIME_1D, RELATED_TIME_1W];

export const DATA_TYPE_INTENSIVE = 'INTENSIVE';
export const DATA_TYPE_INT16 = 'INT16';
export const DATA_TYPE_INT32 = 'INT32';
export const DATA_TYPE_FLOAT = 'FLOAT';
export const DATA_TYPE_BOOL = 'BOOL';
export const DATA_TYPE_CATALOG = 'CATALOG';

export const MONTHS_GET_DATA = 3; //GET DATA WITHIN 3 MONTHS BY DEFAULT

//values are in SECONDS
export const TRIGGER_INTERVAL_10_MIN = { value: 600, name: '10 min' };
export const TRIGGER_INTERVAL_1_HOUR = { value: 6000, name: '1 hour' };
export const TRIGGER_INTERVAL_2_HOUR = { value: 7200, name: '2 hour' };
export const TRIGGER_INTERVAL_1_DAY = { value: 86400, name: '1 day' };

export const TRIGGER_INTERVALS = [TRIGGER_INTERVAL_10_MIN, TRIGGER_INTERVAL_1_HOUR, TRIGGER_INTERVAL_2_HOUR, TRIGGER_INTERVAL_1_DAY];
