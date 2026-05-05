function ShoppingCartListHeader () {
  return (
    <thead>
      <tr class="border-b border-neutral-200 bg-neutral-50">
        <th class="min-w-[260px] px-4 py-3 text-xs font-medium uppercase tracking-wide text-neutral-500">Позиция</th>
        <th class="min-w-[100px] px-3 py-3 text-center text-xs font-medium uppercase tracking-wide text-neutral-500">Цена</th>
        <th class="min-w-[120px] px-3 py-3 text-center text-xs font-medium uppercase tracking-wide text-neutral-500">Кол-во</th>
        <th class="min-w-[110px] px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-neutral-500">Сумма</th>
      </tr>
    </thead>
  )
}

export default ShoppingCartListHeader
