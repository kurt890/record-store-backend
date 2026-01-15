import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customerIdFormat'
})
export class CustomerIdFormatPipe implements PipeTransform {
  transform(customerId: string): string {
    if (!customerId || customerId.trim() === '') {
      return 'N/A';
    }
    return customerId;
  }
}
