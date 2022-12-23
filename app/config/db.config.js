export const HOST = "localhost";
export const USER = "root";
export const PASSWORD = "";
export const DB = "chow_925";
export const dialect = "mysql";
export const logging = 0;
export const pool = {
    max: 100,
    min: 0,
    acquire: 60000,
    idle: 10000,
    evict: 10000,
};
export const dialectOptions = {
    useUTC: false, //for reading from database
    dateStrings: true,
    typeCast: true
};
export const timezone = '+01:00';
export const production = false;