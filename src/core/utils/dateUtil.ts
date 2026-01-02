import {parse} from "date-fns";
import dayjs from 'dayjs';

class DateUtil {
    convertString(dateString?: string, formatString = 'dd/MM/yyyy') {
        if (!dateString) {
            return null;
        }
        return parse(dateString, formatString, new Date());
    }
    toFormat(isoString: string | Date | undefined, format: string = 'DD/MM/YYYY HH:mm'): string {
        if (isoString === undefined) {
            return "-";
        }
        return dayjs(isoString).format(format)
    }
}

export default new DateUtil();