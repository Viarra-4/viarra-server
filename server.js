// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const twilio = require("twilio");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ==========================
// 🔐 بيانات Twilio (من Render)
// ==========================
const accountSid = process.env.TWILIO_ACCOUNT_SID; // 👈 تجي من Environment Variables
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SID;

const client = twilio(accountSid, authToken);

// ==========================
// 📩 إرسال الكود للمستخدم
// ==========================
app.post("/send-code", async (req, res) => {
  const { phone } = req.body;

  try {
    let fullPhone = phone;
    if (!fullPhone.startsWith("+")) {
      fullPhone = "+966" + phone.replace(/^0/, "");
    }

    const verification = await client.verify.v2
      .services(verifySid)
      .verifications.create({ to: fullPhone, channel: "sms" });

    console.log("📩 تم إرسال الكود إلى:", fullPhone);
    res.json({ success: true, message: "✅ تم إرسال الكود إلى رقمك!" });
  } catch (error) {
    console.error("❌ خطأ أثناء إرسال الكود:", error.message);
    res.status(500).json({ success: false, message: "حدث خطأ أثناء الإرسال", error: error.message });
  }
});

// ==========================
// ✅ التحقق من الكود
// ==========================
app.post("/verify-code", async (req, res) => {
  const { phone, code } = req.body;

  try {
    let fullPhone = phone;
    if (!fullPhone.startsWith("+")) {
      fullPhone = "+966" + phone.replace(/^0/, "");
    }

    const verificationCheck = await client.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: fullPhone, code });

    if (verificationCheck.status === "approved") {
      console.log("✅ تم التحقق من الرقم:", fullPhone);
      res.json({ success: true, message: "تم التحقق بنجاح ✅" });
    } else {
      console.log("❌ الكود غير صحيح:", fullPhone);
      res.json({ success: false, message: "الكود غير صحيح ❌" });
    }
  } catch (error) {
    console.error("⚠️ خطأ في التحقق:", error.message);
    res.status(500).json({ success: false, message: "حدث خطأ أثناء التحقق", error: error.message });
  }
});

// ==========================
// 🚀 تشغيل السيرفر
// ==========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});