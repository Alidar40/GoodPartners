import React from 'react';
import Cookies from 'js-cookie';
import { TacoTable, DataType, SortDirection, Formatters, Summarizers, TdClassNames } from 'react-taco-table';

import { formatJsonDateToUTC } from '../utils/date';

class Pricelist extends React.Component {
    constructor(props) {
        super(props);
    	this.companyId = Cookies.get('companyId')
        this.state = {
            pricelist: null,
            pricelistFetched: false,
        }

        fetch('/api/supplier/pricelist/' + this.companyId, {
            method: 'GET',
            /*headers: {
                'Set-Cookie': Cookies.get('.AspNetCore.Identity.Application'),
            }*/
        })
            .then(response => {
                return response.json();
            })
            .then(data => {
                if (JSON.stringify(data) === JSON.stringify([])) {
                    this.setState({ ordersHistory: "PRICELIST_IS_EMPTY", historyFetched: true });
                } else {
                    this.setState({ pricelist: data, pricelistFetched: true });
                }
            })
            .catch(error => {
                console.log(error);
            })
    }

    componentWillUnmount() {
        this.setState({ pricelistFetched: false });
    }

    Pricelist(pricelist, columns) {
        if (pricelist === "PRICELIST_IS_EMPTY") {
            return <div></div>
        }
        return <div>
            <h2>My pricelist</h2>
            <TacoTable
                className="table table-hover simple-example table-full-width table-striped table-sortable"
                columns={columns}
                columnHighlighting
                data={pricelist}
                striped
                sortable
            />
        </div>
    }

    render() {
        if (this.state.pricelistFetched) {
            const columns = [
                {
                    id: 'sku',
                    type: DataType.String,
                    header: 'Sku',
                },
                {
                    id: 'name',
                    type: DataType.String,
                    header: 'Name',
                },
                {
                    id: 'units', type: DataType.String,
                    header: 'Units',
                },
                {
                    id: 'price',
                    type: DataType.NumberOrdinal,
                    header: 'Price',
                }];

            return <div className="container body-content">
                {this.Pricelist(this.state.pricelist, columns)}

            </div>
        } else {
            return <div className="container body-content"><br /><h3>Loading content</h3></div>
        }
    }
}

export default Pricelist;

