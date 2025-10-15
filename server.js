// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const twilio = require("twilio");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// بيانات Twilio الخاصة بك (استبدليها ببياناتك)
const accountSid = "ACa99e313254024ae8ca4ca8bc76ca30b8"; // يبدأ بـ AC
const authToken = "82f14a41d08d5b675c0452b304e010b2";    // التوكن
const verifySid = "VA6df26b1820bfd484c642321047fc6e53";  // Verify SID

const client = twilio(accountSid, authToken);

// إرسال الكود
app.post("/send-code", async (req, res) => {
  const { phone } = req.body;
  try {
    // لو المستخدم كتب رقم بدون +966 نضيفها تلقائيًا
    let fullPhone = phone.startsWith("+966") ? phone : "+966" + phone.slice(1);

    const verification = await client.verify.v2
      .services(verifySid)
      .verifications.create({ to: fullPhone, channel: "sms" });

    console.log("📩 إرسال الكود إلى:", fullPhone);
    res.json({ success: true, message: "تم إرسال الكود!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// التحقق من الكود
app.post("/verify-code", async (req, res) => {
  const { phone, code } = req.body;
  try {
    // نضيف +966 تلقائيًا لو المستخدم كتب الرقم بدونها
    let fullPhone = phone.startsWith("+966") ? phone : "+966" + phone.slice(1);

    const verification_check = await client.verify.v2
      .services(verifySid)
      .verificationChecks.create({ to: fullPhone, code });

    if (verification_check.status === "approved") {
      console.log("✅ الكود صحيح للرقم:", fullPhone);
      res.json({ success: true, message: "تم التحقق بنجاح" });
    } else {
      console.log("❌ الكود غير صحيح:", fullPhone);
      res.json({ success: false, message: "الكود غير صحيح" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// تشغيل السيرفر
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});