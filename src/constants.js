export const CONSTANT = Object.freeze({
    CSV_FILE: Object.freeze({
        PATH :'src/datafiles',
        FILE_NAME : 'AW_VIETU_CENTROIDI.CSV',
        DELIMITER : '#',
        SEPARATOR : ';'
      }),
    DEFAULT_VIEW: Object.freeze({
        PLACE_ZOOM : 13,
        // To place map on middle of Latvia
        // Info is got from here - https://en.wikipedia.org/wiki/Module:Location_map/data/Latvia
        ZOOM : 7,
        LATITUDE : 57,
        LONGITUDE : 24.55
      }),
  });

  export default CONSTANT;