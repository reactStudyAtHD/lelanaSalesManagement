import crypto from "crypto"

export const calculateAllSales = (params) => {
  const { cardSales, moneySales, serviceSales } = params.data
  return Number(cardSales) + Number(moneySales) + Number(serviceSales)
}

export const calculateUnitPrice = (params) => {
  const { cardSales, moneySales, serviceSales, tableCount } = params.data
  const salesSum = Number(cardSales) + Number(moneySales) + Number(serviceSales)
  return tableCount !== 0 ? salesSum / Number(tableCount) : 0
}

export const MakeEmptyObject = (params) => {
  const list = []
  const dateObject = new Date()
  const year = dateObject.getFullYear()
  const date = dateObject.getDate()
  const month = dateObject.getMonth() + 1

  if (params.month === month) {
    for (let i = 1; i < date + 1; i++) {
      const monthString = month < 10 ? `0${month}` : month
      const dateString = i < 10 ? `0${i}` : i
      list.push({
        saleId: crypto
          .createHash("md5")
          .update(`${year}-${monthString}-${dateString}`)
          .digest("hex"),
        saleYear: year,
        saleMonth: month,
        tableCount: 0,
        cardSales: 0,
        moneySales: 0,
        serviceSales: 0,
        saleDate: `${year}-${monthString}-${dateString}`,
      })
    }
  }

  return list
}
