
import CONSTANT from '../constants';
import * as csv from 'jquery-csv';

const livingPlaceService = {
  getLivingPlaces: async() => {
    const response = await fetch(`${CONSTANT.CSV_FILE.PATH}/${CONSTANT.CSV_FILE.FILE_NAME}`);
      const rawCSV = await response.text();
      /*
        According wikipedia living places are villages, cities, 
        https://lv.wikipedia.org/wiki/Apdzīvota_vieta
        So filtering to only contain living places
        Non Living spaces have 2 and more words in it
      */
      return csv.toObjects(rawCSV, { separator: CONSTANT.CSV_FILE.SEPARATOR, delimiter: CONSTANT.CSV_FILE.DELIMITER, onParseValue: csv.hooks.castToScalar }).filter(record => !record.NOSAUKUMS.includes(' '));
  }
}

export default livingPlaceService