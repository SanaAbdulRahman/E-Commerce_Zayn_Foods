
function showError(HtmlElement, errMsg) {
    document.getElementById(HtmlElement).innerHTML = `<div class="alert alert-danger" role="alert">${errMsg}</div>`;
    setTimeout(() => {
        document.getElementById(HtmlElement).innerHTML = `<div></div>`;
    }, 5000)
}

function addressSelector() {
    const addressId = document.getElementById("address").value
    console.log("address changed", addressId)
    fetch(`/${addressId}/address`).then((response) => {
        if (!response.ok) {
            response.json().then((error) => {
                showError("validationError", error)
            })
        } else {
            response.json().then(data => {
                const fetchedAddress = data.data;
                document.getElementById("savedFlatNo").value = fetchedAddress.flatNo;
                document.getElementById("savedStreet").value = fetchedAddress.street;
                document.getElementById("savedLandmark").value = fetchedAddress.landmark;
                document.getElementById("savedDistrict").value = fetchedAddress.district;
                document.getElementById("savedPincode").value = fetchedAddress.pincode;
            })
        }
    }).then(data => console.log(data))
        .catch(error => console.error(error));
}

const addAddress = async () => {
    const flatNo = document.getElementById("flatNo").value;
    const street = document.getElementById("street").value;
    const landmark = document.getElementById("landmark").value;
    const district = document.getElementById("district").value;
    const pincode = document.getElementById("pincode").value;

    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            flatNo: flatNo,
            street: street,
            landmark: landmark,
            district: district,
            pincode: pincode,
        }),
    };

    fetch("/address", requestOptions)
        .then((response) => {
            if (response.status === 422) {
                showError("validationError", "Validation faild, Try verifiy input.")
            } else if (response.status === 201) {
                location.reload();
            }
        })
        .then((data) => {
            console.log(data, "Data");
        })
        .catch((error) => {
            console.log(error, "error");
        });
};

const updateAddress = async () => {
    const addressId = document.getElementById("address").value
    const flatNo = document.getElementById("savedFlatNo").value;
    const street = document.getElementById("savedStreet").value;
    const landmark = document.getElementById("savedLandmark").value;
    const district = document.getElementById("savedDistrict").value;
    const pincode = document.getElementById("savedPincode").value;


    const requestOptions = {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            _id: addressId,
            flatNo: flatNo,
            street: street,
            landmark: landmark,
            district: district,
            pincode: pincode,
        }),
    };

    fetch("/address", requestOptions)
        .then((response) => {
            if (response.status === 422) {
                showError("validationError", "Validation faild, Try verifiy input.")
            } else if (response.ok) {
                location.reload();
            }
        })
        .then((data) => {
            console.log(data, "Data");
        })
        .catch((error) => {
            console.log(error, "error");
        });
};

function checkout(grandTotal) {
    grandTotal = Number(grandTotal)
    let address = document.getElementById('address').value
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            grandTotal: grandTotal,
            addressId: address
        }),
    };

    fetch("/checkout", requestOptions)
        .then((response) => {
            if (!response.ok) {
                response.json().then((error) => {
                    showError("checkoutError", error.message)
                })
            }
            else {
                response.json().then(data => {
                    location.replace(`/reviewPayment?orderId=${data.data.orderId}`);
                })
            }
        })
        .then((data) => {
            console.log(data, "Data");
        })
        .catch((error) => {
            console.log(error, "error");
        });


}

function applyCoupon() {
    const coupon = document.getElementById('coupon').value;
    if (!coupon) {
        showError("couponError", 'Coupon code should not be empty')
    }
    else {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                coupon: coupon
            }),
        };

        fetch("/applyCoupon", requestOptions)
            .then((response) => {
                if (response.status === 200) {
                    console.log(response.status, 'Success')
                    location.reload();
                }
                else {
                    response.json().then(error => {
                        showError('couponError', error.message);
                        authAlert();
                    })
                }
            })
            .then((data) => {
                console.log(data, "Data");
            })
            .catch((error) => {
                console.log(error, "error");
            });
    }
}

function removeCoupon() {
    const couponId = "<%= cartData?.coupon?._id%>"

    const requestOptions = {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            couponId: couponId
        }),
    }

    fetch('/removeCoupon', requestOptions).then(response => {
        if (response.ok) {
            location.reload();
        } else {
            response.json().then(error => {
                showError('couponError', error.message);
            })
        }
    }).then((data) => {
        console.log(data, "Data");
    })
        .catch((error) => {
            console.log(error, "error");
        });
}

function incrementCartItemQuantity(productId, price, totalPrice) {
    '<%=cartItem.price%>', '<%=cartItem.totalPrice%>'
    const requestOptions = {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            productId: productId
        }),
    }

    fetch('/incrementCartItemQuantity', requestOptions).then((response) => response.json())
        .then((data) => {
            document.getElementById("totalPrice" + productId).innerText = "₹" + Number(data.productQuantity) * Number(data.productPrice);
            let subtotal = document.getElementById("subtotal").innerHTML;
            document.getElementById("subtotal").innerHTML = Number(subtotal) + Number(data.productPrice)
            document.getElementById("shipping").innerHTML = data.cartData.shippingCharge;
            document.getElementById("discount").innerHTML = data.cartData.discount;
            document.getElementById("grandTotal").innerHTML = data.cartData.grandTotal;
        })
        .catch((error) => {
            console.log(error, "error");
        });
}

function decrementCartItemQuantity(productId, price, totalPrice) {
    console.log("decrementCartItemQuantity");
    const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            productId: productId
        }),
    }
    fetch('/decrementCartItemQuantity', requestOptions).then((response) => response.json())
        .then((data) => {
            if (data.status == 200) {
                console.log(data.productQuantity, "data.productQuantity")
                if (data.cartData.grandTotal == 0) {
                    location.reload();
                }
                document.getElementById("totalPrice" + productId).innerText = "₹" + Number(data.productQuantity) * Number(data.productPrice);
                let subtotal = document.getElementById("subtotal").innerHTML;
                document.getElementById("subtotal").innerHTML = Number(subtotal) - Number(data.productPrice)
                document.getElementById("shipping").innerHTML = data.cartData.shippingCharge;
                document.getElementById("discount").innerHTML = data.cartData.discount;
                document.getElementById("grandTotal").innerHTML = data.cartData.grandTotal;

                console.log(shipping, subtotal, discount, grandTotal)
            } else {
                location.reload()
            }
        })
        .catch((error) => {
            location.reload()
        });
}

function orderCancel(orderId) {

    cosole.log("orderCancel :", orderId);

}