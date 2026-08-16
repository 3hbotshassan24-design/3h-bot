// ===================================================================
// مصنع 3H - بوت واتساب حريمي V13.5 - جاهز للرفع على Render
// ===================================================================
const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN || '3H_VERIFY_123';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID || '1167452569795257';

const SYSTEM_PROMPT = `
أنت مدير مبيعات في مصنع 3H للأحذية الحريمي. 
شخصيتك: هادي، محترم، بترد من الآخر في سطرين بالكتير.
قاعدة ذهبية: أنت إنسان. ممنوع تقول بوت أو ذكاء اصطناعي نهائياً.

- المنتج: حريمي فقط. مفيش رجالي ولا أطفالي.
- السعر: 400 جنيه للدستة. الدستة = 10 جوز. ثابت مفيش فصال.
- المقاسات: 37، 38، 39، 40، 41 فقط.
- الألوان: كل الألوان متاحة: أبيض، أسود، بيج، بني، أحمر، وردي، أزرق، هافان، دهبي، فضي.
- الدفع: كاش عند الاستلام داخل مصر. خارج مصر مقدم.
- شركة الشحن: إيرجنت فقط.
- عنوان المصنع: عين شمس، المنطقة الصناعية، جنب محطة مترو عين شمس.
- لوكيشن المصنع: https://share.google/0KjJktLvT7j3ckMDX
- أرقام الإدارة: 01007836636 - 01143362855
- صفحة الفيسبوك: https://www.facebook.com/profile.php?id=100065181751381

أسعار الشحن مع إيرجنت:
125: القاهرة، الجيزة، القليوبية، الشرقية، كفر الشيخ
150: الإسكندرية، البحيرة، المنوفية، الغربية، الدقهلية، دمياط، بورسعيد، الإسماعيلية، السويس  
175: الفيوم، بني سويف، المنيا، أسيوط، سوهاج، قنا، الأقصر، أسوان
200: الغردقة، شرم الشيخ، مرسى مطروح، الوادي الجديد، العريش
ملاحظات: "ميتل" = الفيوم، "اليكس" = الإسكندرية، "المنصورة" = الدقهلية

قواعد صارمة:
1. أقصى طول: سطرين.
2. ممنوع: إيموجي، هههه، كلمة بوت.
3. لازم تذكر "مع إيرجنت" في أي رد فيه سعر شحن.
4. متسألش نفس السؤال مرتين. متوعدش بمعاد توصيل.
`;

// ذاكرة بسيطة
const chatMemory = {};

function getReply(userMsg, phone) {
    const msg = userMsg.toLowerCase();
    const name = chatMemory[phone]?.name || '';

    // قواعد سريعة من V13.5
    if (msg.includes('بكام') || msg.includes('سعر') || msg.includes('دستة')) {
        return "الدستة بـ 400 جنيه يا فندم، 10 جوز.";
    }
    if (msg.includes('مقاس')) {
        return "المقاسات من 37 لـ 41 بس يا فندم.";
    }
    if (msg.includes('لون') || msg.includes('الوان')) {
        return "كل الألوان متاحة يا فندم: أبيض، أسود، بيج، بني، أحمر، وردي، أزرق، وغيرها.";
    }
    if (msg.includes('رجالي') || msg.includes('اطفال') || msg.includes('اطفالي')) {
        return "بنشتغل حريمي فقط يا فندم والله.";
    }
    if (msg.includes('36') || msg.includes('42')) {
        return "للأسف يا فندم، المقاسات المتاحة من 37 لـ 41 فقط.";
    }
    if (msg.includes('خصم') || msg.includes('فصال')) {
        return "للأسف يا فندم، 400 جنيه ده سعر المصنع ثابت للكل ومفيش خصم.";
    }
    if (msg.includes('لوكيشن') || msg.includes('عنوان') || msg.includes('فين')) {
        return "المصنع في عين شمس جنب المترو يا فندم. وده اللوكيشن: https://share.google/0KjJktLvT7j3ckMDX";
    }
    if (msg.includes('فيس') || msg.includes('صفحة') || msg.includes('لينك')) {
        return "صفحتنا يا فندم: https://www.facebook.com/profile.php?id=100065181751381";
    }
    if (msg.includes('رقم') || msg.includes('ادارة') || msg.includes('تواصل')) {
        return "للإدارة يا فندم: 01007836636 أو 01143362855";
    }
    if (msg.includes('شحن') || msg.includes('توصيل')) {
        // لو قال المحافظة
        if (msg.includes('قاهرة') || msg.includes('جيزة') || msg.includes('قليوبية') || msg.includes('شرقية') || msg.includes('كفر')) {
            return "شحن القاهرة والجيزة والقليوبية بـ 125 جنيه مع إيرجنت يا فندم.";
        }
        if (msg.includes('اسكندرية') || msg.includes('اليكس') || msg.includes('بحيرة') || msg.includes('منوفية') || msg.includes('غربية') || msg.includes('دقهلية') || msg.includes('منصورة') || msg.includes('دمياط')) {
            return "شحن الإسكندرية والدلتا بـ 150 جنيه مع إيرجنت يا فندم.";
        }
        if (msg.includes('فيوم') || msg.includes('ميتل') || msg.includes('بني سويف') || msg.includes('منيا') || msg.includes('اسيوط') || msg.includes('سوهاج')) {
            return "شحن الصعيد بـ 175 جنيه مع إيرجنت يا فندم.";
        }
        return "حضرتك من محافظة إيه يا فندم عشان أبلغك سعر الشحن مع إيرجنت؟";
    }
    if (msg.includes('عايز') && (msg.includes('دست') || msg.match(/\d/))) {
        return "تمام يا فندم. ابعت الاسم ثلاثي والعنوان ورقم الموبايل والمحافظة والمقاسات.";
    }
    if (msg.includes('شحنت') || msg.includes('بوليصة')) {
        return "طلبك لسه بيتجهز يا فندم، أول ما يتشحن هبعتلك البوليسة على طول.";
    }

    return "اسألني عن الأسعار، المقاسات، الألوان، الشحن مع إيرجنت، اللوكيشن، أو صفحتنا يا فندم.";
}

// Webhook verification
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

// Webhook messages
app.post('/webhook', async (req, res) => {
    const body = req.body;
    if (body.object) {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const message = value?.messages?.[0];
        
        if (message) {
            const from = message.from;
            const text = message.text?.body || '';
            console.log(`رسالة من ${from}: ${text}`);
            
            // تأخير 3-6 ثواني
            const delay = Math.floor(Math.random() * 3000) + 3000;
            await new Promise(r => setTimeout(r, delay));
            
            const reply = getReply(text, from);
            
            // حفظ اسم لو قال
            if (!chatMemory[from]) chatMemory[from] = {};
            
            try {
                await axios.post(
                    `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
                    {
                        messaging_product: 'whatsapp',
                        to: from,
                        text: { body: reply }
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                console.log(`رد: ${reply}`);
            } catch (e) {
                console.error('خطأ في الارسال:', e.response?.data || e.message);
            }
        }
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

app.get('/', (req, res) => {
    res.send('بوت مصنع 3H شغال - حريمي فقط');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
