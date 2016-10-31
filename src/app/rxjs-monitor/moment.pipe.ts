import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
    name: 'moment'
})
export class MomentPipe implements PipeTransform {
    transform(value: any, args: any[]): any {
        let format = 'HH:mm:ss';
        return moment(value).format(format);
    }
}