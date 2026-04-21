import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'currencyBrl' })
export class CurrencyBrlPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    const n = typeof value === 'string' ? parseFloat(value) : value ?? 0;
    if (isNaN(n as number)) return 'R$ 0,00';
    return (n as number).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    });
  }
}
