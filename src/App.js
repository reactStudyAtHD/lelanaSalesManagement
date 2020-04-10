import React, { useState, useEffect } from "react"
import "./App.css"
import "ag-grid-community/dist/styles/ag-grid.css"
import "ag-grid-community/dist/styles/ag-theme-balham.css"
import axios from "axios"
import SalesGrid from "./components/SalesGrid"
import {
  calculateAllSales,
  calculateUnitPrice,
  MakeEmptyObject,
} from "./util/sales/calculate"
import _ from "lodash"

function App() {
  const dateObject = new Date()
  const [todayMap, setTodayMap] = useState({
    year: dateObject.getFullYear(),
    month: dateObject.getMonth() + 1,
  })
  const [loading, setLoading] = useState(false)
  const [originData, setOriginData] = useState([])
  const [defaultData, setDefaultData] = useState({
    columnDefs: [
      {
        checkboxSelection: true,
        width: 50,
      },
      {
        headerName: "날짜",
        field: "saleDate",
      },
      {
        headerName: "서비스 매출",
        field: "serviceSales",
        editable: true,
      },
      {
        headerName: "현금 매출",
        field: "moneySales",
        editable: true,
      },
      {
        headerName: "카드 매출",
        field: "cardSales",
        editable: true,
      },
      {
        headerName: "테이블 수",
        field: "tableCount",
        editable: true,
      },
      {
        headerName: "총 매출",
        valueGetter(params) {
          return calculateAllSales(params)
        },
      },
      {
        headerName: "객단가",
        valueGetter(params) {
          return calculateUnitPrice(params)
        },
      },
    ],
    rowData: [],
  })

  const fetchMonthSalesData = async (params) => {
    try {
      setOriginData([])
      setLoading(true)
      const response = await axios.get("http://ctk0327.iptime.org:8080/sales", {
        params,
      })
      const cloneResponseData = _.cloneDeep(response)
      if (response.data.length === 0) {
        setDefaultData({ ...defaultData, rowData: MakeEmptyObject(params) })
      } else {
        setOriginData(response.data)
        setDefaultData({ ...defaultData, rowData: cloneResponseData.data })
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => {
    const dateObject = new Date()
    const year = dateObject.getFullYear()
    const month = dateObject.getMonth() + 1

    fetchMonthSalesData({
      saleYear: year,
      saleMonth: month,
    })
  }, [])

  return (
    <div className='App'>
      {loading ? (
        <div>로딩중</div>
      ) : (
        <SalesGrid
          originData={originData}
          defaultData={defaultData}
          setDefaultData={setDefaultData}
          fetchMonthSalesData={fetchMonthSalesData}
          todayMap={todayMap}
          setTodayMap={setTodayMap}
        />
      )}
    </div>
  )
}

export default App
