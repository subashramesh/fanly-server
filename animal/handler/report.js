const db = require('../service/postgres.js')

exports.location = async (req, res) => {
    try {
        const {start, end} = req.body
        let locationQuery = req.body.location
        let sales = await db.knex('sale').select('*').where(
            b => {
                b.where('createdAt', '>=', start)
                b.where('createdAt', '<=', end)
                if (locationQuery){
                    b.where('location','=', locationQuery)
                }
            }
        )
        let productIds = sales.map(sale => sale.product)
        let products = await db.knex('product').select('*').whereIn('id', productIds)
        let productMap = {}
        products.forEach(p => {
            try{
                p.data = JSON.parse(p.data)
            } catch(e){
                console.log(e)
            }
            productMap[p.id] = p
        })
        sales.forEach(e => {
            try{
                e.data = JSON.parse(e.data)
                e.productData = productMap[e.product]
            } catch(e){
                console.log(e)
            }
        });
        

        let locations = await db.knex('location').select('*');

        let data = []

        for (let i = 0; i < locations.length; i++){
            let location = locations[i]
            if(locationQuery){
                if (location.id != locationQuery){
                    continue
                }
            }
            let locationSales = sales.filter(sale => sale.location === location.id)
            let total = 0, quantity = 0
            let d = {}
            for (let j = 0; j < locationSales.length; j++){
                let value = parseInt(`${locationSales[j].total || 0}`)
                let qv = parseInt(`${locationSales[j].quantity || 0}`)
                d = locationSales[j].data || d
                total += value
                quantity += qv
            }
            let salesGroupByProduct = []

            locationSales.forEach(sale => {
                let product = sale.productData
                let index = salesGroupByProduct.findIndex(e => e.product.id === product.id)
                if (index === -1){
                    salesGroupByProduct.push({
                        product: product,
                        name: product.name,
                        total: 0,
                        quantity: 0,
                        sales: []
                    })
                    index = salesGroupByProduct.length - 1
                }
                salesGroupByProduct[index].total += parseInt(`${sale.total || 0}`)
                salesGroupByProduct[index].quantity += parseInt(`${sale.quantity || 0}`)
                salesGroupByProduct[index].data = sale.data
                salesGroupByProduct[index].price = sale.price
                salesGroupByProduct[index].sales.push(sale)
            })

            data.push({
                location: location,
                total: total,
                quantity: quantity,
                data: d,
                summary: salesGroupByProduct,
                sales: locationSales,
                products: salesGroupByProduct.map(e => e.product)
            })
        }
        
        return res.send({
            status: '200',
            message: 'Success',
            data: data
        })
    } catch(e){
        console.log(e)
        return res.send({
            status: '500',
            message: `Internal Server Error ${e}`
        })
    }
}