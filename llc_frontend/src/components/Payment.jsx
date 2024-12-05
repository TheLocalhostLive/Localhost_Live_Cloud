import { useState } from "react";
import { TextField, Button, Paper, Typography, Box, Snackbar, Alert } from "@mui/material";
import { useRazorpay } from "react-razorpay";

const PaymentComponent = () => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { error, isLoading, Razorpay } = useRazorpay();

  const handlePayment = async () => {
    if (!amount) {
      alert("Please enter an amount");
      return;
    }

    setLoading(true);
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/create_order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: parseFloat(amount) * 100 }), // Convert to paise
    });

    const orderData = await response.json();
    const orderId = orderData.id; // Get the order ID from the response

    const options = {
      key: "rzp_test_prB6bb3aMwxOFB",
      amount: orderData.amount,
      currency: orderData.currency,
      name: "LLC",
      description: "Donation",
      order_id: orderId,
      handler: function (response) {
        setSuccess(true);
        console.log(response);
        // Send payment details to the server for verification
      },
      prefill: {
        name: "Your Name",
        email: "youremail@example.com",
        contact: "9999999999",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const rzp = new Razorpay(options);
    rzp.open();
    setLoading(false);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSuccess(false);
  };

  return (
    <Box sx={{padding: "100px"}}>
      <Snackbar open={success} autoHideDuration={6000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Payment was Successful !! Thanks for your valuable donation..
        </Alert>
      </Snackbar>

      <Snackbar open={error} autoHideDuration={6000}>
        <Alert
         
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Payment Failed !! Kindly Retry after some times..
        </Alert>
      </Snackbar>
      <Paper
        elevation={3}
        style={{
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "300px",
          margin: "auto",
          backgroundColor: "#2c2c2c", // Dark background for the card
          color: "#fff", // Light text color
        }}
      >
        <Typography variant="h6" gutterBottom>
          Enter Payment Amount
        </Typography>
        <TextField
          variant="outlined"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          fullWidth
          style={{ marginBottom: "20px", backgroundColor: "#444" }} // Dark input background
        />
        <Button
          onClick={handlePayment}
          disabled={loading}
          variant="contained"
          color="primary"
          style={{
            width: "100%",
            backgroundColor: "#3399cc",
            color: "#fff",
          }}
        >
          {loading ? "Processing..." : "Pay Now"}
        </Button>
      </Paper>
    </Box>
  );
};

export default PaymentComponent;
