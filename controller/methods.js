const express = require('express')
const paypal = require('paypal-rest-sdk')


module.exports = {
  payment: async(req, res, next) => {
    const create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": "http://localhost:3000/success",
          "cancel_url": "http://localhost:3000/cancel"
      },
      "transactions": [{
          "item_list": {
            "items": [{
              "name": "Red Sox Hat",
              "sku": "001",
              "price": "25.00",
              "currency": "USD",
              "quantity": 1
            }]
          },
          "amount": {
            "currency": "USD",
            "total": "25.00"
          },
          "description": "Hat for the beest team ever"
      }]
    };
    paypal.payment.create(create_payment_json, function (error, payment) {
      if (error) {
        throw error
      } else {
        for(let i = 0; i < payment.links.length; i++){
          if(payment.links[i].rel == 'approval_url'){
            res.redirect(payment.links[i].href)
          }
        }
      }
    }) 
  },

  payout: async (req, res, next) => {
    var d = new Date(); // for now
    var hour = d.getHours(); // => 9
    var min = d.getMinutes(); // =>  30
    var sec = d.getSeconds(); // => 51


    var sender_batch_id = `${hour}${min}${sec}`
    console.log('sender_batch_id : ', sender_batch_id)

    const create_payout_json = {
      "sender_batch_header": {
        "sender_batch_id": sender_batch_id,
        "email_subject": "You have a payment"
      },
      "items": [
        {
          "recipient_type": "EMAIL",
          "amount": {
            "value": 1,
            "currency": "USD"
          },
          "receiver": "oneApple@eat.this",
          "note": "del.",
          "sender_item_id": "item_1"
        },
        {
          "recipient_type": "EMAIL",
          "amount": {
            "value": 2,
            "currency": "USD"
          },
          "receiver": "twoApple@eat.this",
          "note": "del.",
          "sender_item_id": "item_2"
        },
        {
          "recipient_type": "EMAIL",
          "amount": {
            "value": 3,
            "currency": "USD"
          },
          "receiver": "threeApple@eat.this",
          "note": "del.",
          "sender_item_id": "item_3"
        }
      ]
    }

    paypal.payout.create(create_payout_json, function (error, payout) {
      if (error) {
        console.log(error.response);
        throw error;
      } else {
        console.log("Create Payout Response");
        console.log(payout);
        console.log('payout details')

        var payoutId = payout.batch_header.payout_batch_id;

        paypal.payout.get(payoutId, function (error, payout) {
          if (error) {
              console.log(error);
              throw error;
          } else {
              console.log("Get Payout Response");
              console.log(JSON.stringify(payout));

              const fee = payout.batch_header.fees.value
              const amount = payout.batch_header.amount.value
              const payAmount = amount + fee
              
              res.send(`#amount: \$${amount} \n #fee: \$${fee} \n #payAmount : \$${payAmount}`)
          }
        });

      }
    })
  }

}