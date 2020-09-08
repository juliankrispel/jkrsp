---
title: Event Sourcing in Credit
date: "2020-05-12T18:00:00.284Z"
description: Event Sourcing in Credit
draft: true
---

Let's try and represent a Loan with Event Sourcing.

**Events**:
- OpenAccount
- ChangePaymentDay
- ChangePaymentAmount
- ChangeInterestRate
- SetPaymentHoliday
- Payment
- InterestAccrual
- Credit
- WriteOff



Projections and side effects

Principle Balance | Arrears | 