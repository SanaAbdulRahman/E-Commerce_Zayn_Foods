require("vendor/sweetalert/sweetalert.min.js");

function authAlert() {
    swal({

        title: "Sign In first",
        text: "Only Signed user can add dish to cart",
        icon: "warning",
        buttons: true,
        dangerMode: true,
        buttons: ["Cancel", "Sign In"],

    })
        .then((willDelete) => {
            if (willDelete) {
                $(".js-panel-myaccount").addClass("show-header-myaccount");
            }
        });
}
export { authAlert };