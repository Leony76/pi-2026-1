export const priceFormat = (price:number) => {
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return formatter.format(price);
}

export const stringPriceFormat = (price:string) => {
  if (!price) return '';

  const number = Number(price) / 100;

  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}