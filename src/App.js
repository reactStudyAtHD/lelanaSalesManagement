import React, { useState, useEffect } from "react"
import "./App.css"
import "ag-grid-community/dist/styles/ag-grid.css"
import "ag-grid-community/dist/styles/ag-theme-balham.css"
import axios from "axios"
import SalesGrid from "./components/SalesGrid"
import { MakeEmptyObject } from "./util/sales/calculate"
import _ from "lodash"
import SalesViewer from "./components/SalesViewer"
import { Link, Switch, Route, BrowserRouter } from "react-router-dom"
import Home from "./components/Home"

function App() {
  const fetchMonthSalesData = async (params) => {
    try {
      setOriginData([])
      setLoading(true)
      const response = await axios.get("http://ctk0327.iptime.org:8080/sales", {
        params,
      })
      const cloneResponseData = _.cloneDeep(response)
      if (response.data.length === 0) {
        setRowData(MakeEmptyObject(params))
      } else {
        setOriginData(response.data)
        setRowData(cloneResponseData.data)
      }
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }
  const [defaultDate, setDefaultDate] = useState(new Date())

  useEffect(() => {
    const dateObject = new Date()
    const year = dateObject.getFullYear()
    const month = dateObject.getMonth() + 1
    fetchMonthSalesData({
      saleYear: year,
      saleMonth: month,
    })
  }, [])

  const dateObject = new Date()
  const [todayMap, setTodayMap] = useState({
    year: dateObject.getFullYear(),
    month: dateObject.getMonth() + 1,
  })
  const [loading, setLoading] = useState(false)
  const [originData, setOriginData] = useState([])
  const [rowData, setRowData] = useState([])

  return (
    <div className='App'>
      <BrowserRouter>
        <header>
          <Link to='/sale-manage'>매출관리</Link>
          <Link to='sale-calendor'>매출달력</Link>
        </header>
        <Switch>
          <Route exact path='/' component={Home} />
          <Route
            path='/sale-manage'
            render={(props) => (
              <SalesGrid
                originData={originData}
                rowData={rowData}
                setRowData={setRowData}
                fetchMonthSalesData={fetchMonthSalesData}
                todayMap={todayMap}
                setTodayMap={setTodayMap}
              />
            )}
          />
          <Route
            path='/sale-calendor'
            render={(props) => (
              <SalesViewer
                rowData={rowData}
                fetchMonthSalesData={fetchMonthSalesData}
                defaultDate={defaultDate}
                setDefaultDate={setDefaultDate}
              />
            )}
          />
        </Switch>
      </BrowserRouter>

      {/* {loading ? (
        <div>로딩중</div>
      ) : (
      )} */}
    </div>
  )
}

export default App
