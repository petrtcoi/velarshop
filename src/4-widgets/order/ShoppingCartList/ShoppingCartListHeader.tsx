function ShoppingCartListHeader () {
  return (
    <thead>
      <tr class="border-b border-neutral-200">
        <th class="text-xs font-thin py-3 pl-3 min-w-[250px]">Наименование</th>
        <th class="text-xs font-thin py-3 text-center min-w-[100px]">Цена, руб</th>
        <th class="text-xs font-thin py-3 text-center min-w-[90px] max-w-[120px]">Кол-во</th>
        <th class="text-xs font-thin py-3 text-center min-w-[100px]">Сумма, руб</th>
      </tr>
    </thead>
  )
}

export default ShoppingCartListHeader