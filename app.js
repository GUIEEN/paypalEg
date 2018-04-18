const express = require('express')
const ejs = require('ejs')
const paypal = require('paypal-rest-sdk')
const controller = require('./controller/methods')

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AZQJmj03jEKf_xNReza40gktIel_BGaoH1LaFAsz3bqs-_wdzwq3R0Q80HTOv4lLNi8HSFESmm8yJD4c',
  'client_secret': 'EOsN1AjMkK-4LQCrwjLIBSnOMtmGzgi3OMDNwl7gM7XWK0qnIEgFHponj8oVjpnZT6PXsUJiUkrpNkwW'
});

const app = express()

app.set('view engine', 'ejs')
app.get('/', (req, res) => res.render('index'))


app.post('/payment', controller.payment)

app.get('/success', (req, res) => {
  const {PayerID, paymentId} = req.query

  console.log(' PayerId :: ' , PayerID)
  const execute_payment_json = {
    "payer_id": PayerID,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": "25.00"
      }
    }]
  }

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
      console.log(error.response)
      throw error
    } else {
      console.log("Get Payment Response")
      console.log(JSON.stringify(payment))

      console.log('----sales---')
      console.log(payment.transactions[0].related_resources[0].sale)

      const sale = payment.transactions[0].related_resources[0].sale
      const amount = sale.amount.total
      const fee = sale.transaction_fee.value

      const realIncome = amount - fee

      console.log(realIncome)


      res.send(`#amount: \$${amount} \n #fee: \$${fee} \n #realIncome : \$${realIncome}`)
    }
  })
})

app.get('/cancel', (req, res) => {
  res.send('Fail')
})

app.post('/payout', controller.payout)

app.listen(3000, () => console.log('Server Started'))