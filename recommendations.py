 # Get the Arabic juz name
juz_names = {
            1: "الم", 2: "سَيَقُولُ", 3: "تِلْكَ ٱلرُّسُلُ", 4: "لَنْ تَنَالُوا", 
            5: "وَٱلْمُحْصَنَاتُ", 6: "لَا يُحِبُّ ٱللهُ", 7: "وَإِذَا سَمِعُوا", 
            8: "وَلَوْ أَنَّنَا", 9: "قَالَ ٱلْمَلَأُ", 10: "وَٱعْلَمُوا",
            11: "يَعْتَذِرُونَ", 12: "وَمَا مِنْ دَآبَّةٍ", 13: "وَمَا أُبَرِّئُ", 
            14: "رُبَمَا", 15: "سُبْحَانَ ٱلَّذِى", 16: "قَالَ أَلَمْ",
            17: "ٱقْتَرَبَ لِلنَّاسِ", 18: "قَدْ أَفْلَحَ", 19: "وَقَالَ ٱلَّذِينَ", 
            20: "أَمَّنْ خَلَقَ", 21: "أُتْلُ مَاأُوحِیَ", 22: "وَمَنْ يَقْنُتْ",
            23: "وَمَا لِيَ", 24: "فَمَنْ أَظْلَمُ", 25: "إِلَيْهِ يُرَدُّ", 
            26: "حم", 27: "قَالَ فَمَا خَطْبُكُمْ", 28: "قَدْ سَمِعَ ٱللهُ",
            29: "تَبَارَكَ ٱلَّذِى", 30: "عَمَّ"
        }
# Dictionary mapping emotions to their recommended surahs
SURAH_RECOMMENDATIONS = {
    "happy": [1, 19, 104, 107, 108],  
    "sad": [2, 103, 93, 105], 
    "angry": [1], 
    "fear": [112, 113, 114],  
    "disgust": [1],  
    "neutral": [1],  
    "surprise": [1], 
    "depressed": [1, 55, 36, 112, 93, 112, 113, 114, 76, 18, 56], 
    "anxiety": [59, 67, 1, 24, 5, 9],  
    "stress": [76, 1, 36, 18, 59, 67, 56, 55, 3, 2, 112, 113, 114, 93], 
    "pain": [1,19,55],
    "cancer":[1,36, 55],
    'icu':[1,12]
}

# Dictionary mapping emotions to their recommended ayahs
AYAH_RECOMMENDATIONS = {
    "happy": [
        {"surah": 2, "ayah": 11},
        {"surah": 11, "ayah": 41},
        {"surah": 27, "ayah": 19},
        {"surah": 46, "ayah": 15},
        {"surah": 14, "ayah": 37},
        {"surah": 5, "ayah": 114},
        {"surah": 25, "ayah": 65},
        {"surah": 44, "ayah": 12}
    ],
    "sad": [
        {"surah": 21, "ayah": 87},
        {"surah": 7, "ayah": 23},
        {"surah": 3, "ayah": 193},
        {"surah": 12, "ayah": 101},
        {"surah": 40, "ayah": 7},
        {"surah": 71, "ayah": 28},
        {"surah": 2, "ayah": 286},
        {"surah": 25, "ayah": 74},
        {"surah": 12, "ayah": 87},
        {"surah": 15, "ayah": 56},
        {"surah": 30, "ayah": 36}
    ],
    "angry": [
        {"surah": 7, "ayah": 47},
        {"surah": 23, "ayah": 94},
        {"surah": 3, "ayah": 194}
    ],
    "disgust": [
        {"surah": 3, "ayah": 53},
        {"surah": 3, "ayah": 194}
    ],
    "surprise": [
        {"surah": 3, "ayah": 191},
        {"surah": 21, "ayah": 83},
        {"surah": 23, "ayah": 109},
        {"surah": 26, "ayah": 83},
        {"surah": 12, "ayah": 111},
        {"surah": 27, "ayah": 19}
    ],
    "neutral": [
        {"surah": 13, "ayah": 20},
        {"surah": 17, "ayah": 82},
        {"surah": 6, "ayah": 82},
        {"surah": 18, "ayah": 16},
        {"surah": 13, "ayah": 28},
        {"surah": 22, "ayah": 46},
        {"surah": 7, "ayah": 179},
        {"surah": 41, "ayah": 44},
        {"surah": 10, "ayah": 57},
        {"surah": 17, "ayah": 45}
    ],
    "fear": [
        {"surah": 2, "ayah": 126},
        {"surah": 14, "ayah": 35},
        {"surah": 68, "ayah": 52},
        {"surah": 23, "ayah": 97},
        {"surah": 38, "ayah": 41}
    ],
    "anxiety": [
        {"surah": 13, "ayah": 28},
        {"surah": 17, "ayah": 82},
        {"surah": 20, "ayah": 124}
    ],
    "stress": [
        {"surah": 2, "ayah": 155},
        {"surah": 24, "ayah": 21},
        {"surah": 12, "ayah": 1},
        {"surah": 55, "ayah": 29}
    ],
    "depressed": [
        {"surah": 2, "ayah": 156},
        {"surah": 12, "ayah": 87},
        {"surah": 39, "ayah": 53},
        {"surah": 2, "ayah": 216},
        {"surah": 2, "ayah": 155},
        {"surah": 24, "ayah": 21}
    ],
    "icu":[
        {"surah": 2, "ayah": 255},
        {"surah": 94, "ayah": 5},
        {"surah": 2, "ayah": 286},
        {"surah": 10, "ayah": 57},
        {"surah": 17, "ayah": 82},
        {"surah": 9, "ayah": 51}

    ],
        "cancer":[
        {"surah": 2, "ayah": 255},
        {"surah": 21, "ayah": 83},
        {"surah": 39, "ayah": 53},
        {"surah": 13, "ayah": 28},
  
    ]
}

# Add this to your existing HADITH_RECOMMENDATIONS dictionary after AYAH_RECOMMENDATIONS
HADITH_RECOMMENDATIONS = {
    "happy": [
        {
            "arabic": "إن أفرح الناس بالله يوم القيامة، أكثرهم له ذكرا في الدنيا",
            "english": "The happiest people with Allah on the Day of Judgment will be those who remembered Him the most in the world.",
            "urdu": "قیامت کے دن اللہ کے نزدیک سب سے زیادہ خوش وہ ہوگا جو دنیا میں اللہ کا سب سے زیادہ ذکر کرتا رہا۔",
            "reference": "Musnad Ahmad 10777"
        },
        {
            "arabic": "من لا يشكر الناس لا يشكر الله",
            "english": "Whoever does not thank people has not thanked Allah.",
            "urdu": "جو لوگوں کا شکر ادا نہیں کرتا، وہ اللہ کا بھی شکر ادا نہیں کرتا۔",
            "reference": "Sunan Tirmidhi 1954"
        },
        {
            "arabic": "طيب النفس من النعم",
            "english": "A cheerful heart is one of the blessings.",
            "urdu": "خوش مزاجی اللہ کی ایک نعمت ہے۔",
            "reference": "Sunan Ibn Majah 2141"
        }
    ],
    "sad": [
        {
            "arabic": "ما يصيب المسلم من نصب ولا وصب ... إلا كفر الله بها من خطاياه",
            "english": "No fatigue, nor disease, nor sorrow, nor sadness... befalls a Muslim, except that Allah expiates some of his sins.",
            "urdu": "جو بھی تکلیف، بیماری، غم یا دکھ کسی مسلمان کو پہنچے ... اللہ اسے اس کے گناہوں کا کفارہ بنا دیتا ہے۔",
            "reference": "Sahih Bukhari 5641, Sahih Muslim 2573"
        },
        {
            "arabic": "فإن مع العسر يسرا",
            "english": "Indeed, with hardship comes ease.",
            "urdu": "بے شک تنگی کے ساتھ آسانی ہے۔",
            "reference": "Sahih Muslim 2999"
        },
        {
            "arabic": "من يرد الله به خيرا يصب منه",
            "english": "If Allah intends good for someone, He afflicts them with trials.",
            "urdu": "اللہ جس کے ساتھ بھلائی کا ارادہ کرتا ہے، اسے آزمائش میں مبتلا کر دیتا ہے۔",
            "reference": "Sahih al-Bukhari 5645"
        }
    ],
    "angry": [
        {
            "arabic": "ليس الشديد بالصرعة، إنما الشديد الذي يملك نفسه عند الغضب",
            "english": "The strong one is not the one who defeats others in wrestling, but the one who controls himself when angry.",
            "urdu": "قوی وہ نہیں جو دوسرے کو پچھاڑ دے، بلکہ قوی وہ ہے جو غصے کے وقت اپنے آپ پر قابو رکھے۔",
            "reference": "Sahih al-Bukhari 6114, Sahih Muslim 2609"
        },
        {
            "arabic": "لا تغضب",
            "english": "Do not get angry.",
            "urdu": "غصہ نہ کرو۔",
            "reference": "Sahih al-Bukhari 6116"
        },
        {
            "arabic": "من كظم غيظا وهو قادر على أن ينفذه دعاه الله على رؤوس الخلائق",
            "english": "Whoever suppresses anger, while being able to act upon it, Allah will call him before all of creation.",
            "urdu": "جو شخص غصے کو پی جائے حالانکہ وہ اسے نکال سکتا ہے، اللہ تعالیٰ قیامت کے دن تمام مخلوق کے سامنے اسے بلائے گا۔",
            "reference": "Sunan Ibn Majah 4186"
        }
    ],
  "fear": [
    {
        "arabic": "عن أنس، قال: دخل النبي ﷺ على شاب وهو في الموت، فقال: كيف تجدك؟ قال: والله يا رسول الله إني أرجو الله، وإني أخاف ذنوبي، فقال رسول الله ﷺ: لا يجتمعان في قلب عبد في مثل هذا الموطن، إلا أعطاه الله ما يرجو، وآمنه مما يخاف",
        "english": "Anas reported: The Prophet ﷺ entered upon a young man who was dying and said: How do you feel? He said: By Allah, O Messenger of Allah, I have hope in Allah, but I fear my sins. The Messenger of Allah ﷺ said: These two feelings do not combine in the heart of a servant in such a moment except that Allah grants him what he hopes for and protects him from what he fears.",
        "urdu": "حضرت انسؓ سے روایت ہے کہ نبی کریم ﷺ ایک نوجوان کے پاس عیادت کے لیے تشریف لائے جو قریب الموت تھا۔ آپ ﷺ نے فرمایا: تمہاری کیفیت کیسی ہے؟ اس نے عرض کیا: اللہ کی قسم، اے اللہ کے رسول! میں اللہ سے امید رکھتا ہوں لیکن اپنے گناہوں سے ڈرتا ہوں۔ نبی کریم ﷺ نے فرمایا: کسی بندے کے دل میں ایسی حالت میں یہ دونوں باتیں امید اور خوف جمع نہیں ہوتیں مگر اللہ تعالیٰ اسے وہ عطا فرماتا ہے جس کی وہ امید رکھتا ہے، اور اسے اس چیز سے امن عطا کرتا ہے جس سے وہ ڈرتا ہے۔",
        "reference": "Sunan Ibn Majah 4261"
    },
    {
        "arabic": "عن أبي ذر، قال: قال لي رسول الله ﷺ: اتق الله حيثما كنت، وأتبع السيئة الحسنة تمحها، وخالق الناس بخلق حسن",
        "english": "Abu Dharr reported: The Messenger of Allah ﷺ said: Fear Allah wherever you are. Follow up a bad deed with a good one, it will erase it, and behave well towards people.",
        "urdu": "حضرت ابوذرؓ سے روایت ہے کہ رسول اللہ ﷺ نے فرمایا: اللہ سے ڈرتے رہو جہاں کہیں بھی ہو، اور کسی برائی کے بعد نیکی کرو، وہ اسے مٹا دے گی، اور لوگوں سے حسن اخلاق کے ساتھ پیش آؤ۔",
        "reference": "Jami at-Tirmidhi 1987"
    },
    {
        "arabic": "عن عبد الله بن مسعود، قال: قال رسول الله ﷺ: ما من عبد مؤمن يخرج من عينيه دمعة، وإن كانت مثل رأس الذباب، من خشية الله، فتصيب شيئا من وجهه، إلا حرمه الله على النار",
        "english": "Abdullah ibn Masud reported: The Messenger of Allah ﷺ said: No believing servant sheds a tear, even as small as the head of a fly, out of fear of Allah, and it touches his face, but Allah makes the Hellfire forbidden for him.",
        "urdu": "حضرت عبداللہ بن مسعودؓ سے روایت ہے کہ رسول اللہ ﷺ نے فرمایا: کوئی مومن بندہ ایسا نہیں جس کی آنکھ سے اللہ کے خوف سے ایک آنسو بہے، چاہے مکھی کے سر کے برابر ہو، اور وہ اس کے چہرے کو چھو لے، تو اللہ تعالیٰ اس پر دوزخ کی آگ حرام کر دیتا ہے۔",
        "reference": "Sunan Ibn Majah 4197"
    }
]
,
"surprise": [
  {
    "arabic": "عجبا لأمر المؤمن، إن أمره كله خير، وليس ذاك لأحد إلا للمؤمن، إن أصابته سراء شكر، فكان خيراً له، وإن أصابته ضراء صبر، فكان خيراً له",
    "english": "Wondrous is the affair of the believer, for there is good for him in every matter—and this is not the case with anyone except the believer. If he is happy, he thanks Allah, and that is good for him; and if he is harmed, he shows patience, and that is good for him.",
    "urdu": "مومن کا معاملہ بھی عجیب ہے، اس کے ہر حال میں خیر ہے، اور یہ بات صرف مومن کے لیے ہے۔ اگر اسے خوشی حاصل ہو تو شکر کرتا ہے، تو یہ اس کے لیے بہتر ہے؛ اور اگر اسے کوئی تکلیف پہنچے تو صبر کرتا ہے، تو یہ بھی اس کے لیے بہتر ہے۔",
    "reference": "Sahih Muslim 2999"
  },
  {
    "arabic": "المؤمن القوي خير وأحب إلى الله من المؤمن الضعيف، وفي كل خير، احرص على ما ينفعك، واستعن بالله، ولا تعجز، وإن أصابك شيء، فلا تقل لو أني فعلت كذا، كان كذا وكذا، ولكن قل قدر الله وما شاء فعل، فإن لو تفتح عمل الشيطان",
    "english": "The strong believer is better and more beloved to Allah than the weak believer, though both have goodness. Strive for what benefits you, seek help from Allah, and do not give up. If something befalls you, do not say, If only I had done this or that, but say, Allah decreed, and what He wills, He does, for if only opens the door to the deeds of Satan.",
    "urdu": "طاقتور مومن اللہ کے نزدیک کمزور مومن سے بہتر اور زیادہ محبوب ہے، حالانکہ دونوں میں بھلائی ہے۔ اس چیز کے لیے کوشش کرو جو تمہیں نفع دے، اللہ سے مدد مانگو، اور ہمت نہ ہارو۔ اگر تمہیں کوئی مصیبت پہنچے تو یہ نہ کہو: اگر میں ایسا کرتا تو ایسا ہوتا، بلکہ کہو: اللہ نے تقدیر فرمائی، اور جو چاہا، کیا، کیونکہ اگر کہنا شیطان کے عمل کا دروازہ کھولتا ہے۔",
    "reference": "Sahih Muslim 2664"
  },
  {
    "arabic": "قال النبي ﷺ: سبحان الله والله أكبر عند التعجب",
    "english": "The Prophet ﷺ said: Subhanallah (Glory be to Allah) and Allahu Akbar (Allah is the Greatest) when expressing amazement.",
    "urdu": "نبی ﷺ نے تعجب کے وقت فرمایا: سبحان اللہ اور اللہ اکبر۔",
    "reference": "Sahih al-Bukhari, Chapter: Saying Takbir and Tasbih when surprised"
  }
],
"disgust": [
   {
    "arabic": "إن الله طيب لا يقبل إلا طيبا",
    "english": "Allah is pure and accepts only that which is pure.",
    "urdu": "بیشک اللہ پاک ہے اور صرف پاک چیز کو قبول فرماتا ہے۔",
    "reference": "Sahih Muslim 1015"
    },
    {
    "arabic": "إن التثاؤب من الشيطان فإذا تثاءب أحدكم فلْيَكْظِمْ ما استطاع",
    "english": "Yawning is from the devil. So, when one of you yawns, he should try to restrain it as far as it lies in his power",
    "urdu": "جمائی شیطان کی طرف سے ہے، لہٰذا جب تم میں سے کسی کو جمائی آئے تو وہ جہاں تک ممکن ہو اسے روکنے کی کوشش کرے۔",
    "reference": "Sahih Muslim 2994"
    },
    {
    "arabic": "بينما رسول الله صلى الله عليه وسلم يصلي رأى في قبلة المسجد نخامة فحكها بيده فتغير وجهه ثم قال: إذا صلى أحدكم فإن الله قبله فلا يتنخّم قبله في الصلاة",
    "english": "While the Messenger of Allah (ﷺ) was praying, he saw sputum in the direction of the Qiblah in the mosque. He scraped it off with his hand, and the sign of disgust was apparent on his face. Then he said, When any one of you is praying, Allah is in front of him, so do not spit in front of him during prayer.",
    "urdu": "جب رسول اللہ صلی اللہ علیہ وسلم نماز پڑھ رہے تھے تو مسجد میں قبلہ کی سمت میں تھوک دیکھی۔ آپ نے اسے اپنے ہاتھ سے صاف کیا اور چہرے پر کراہیت کے آثار ظاہر ہوئے۔ پھر فرمایا، جب تم میں سے کوئی نماز پڑھ رہا ہو تو اللہ اس کے سامنے ہوتا ہے، اس لیے نماز میں اپنے سامنے تھوکا نہ کرو۔",
    "reference": "Sahih Bukhari 6111"
  }
],
    "neutral": [
        {
            "arabic": "ما يصيب المسلم من نصب ولا وصب ... إلا كفر الله بها من خطاياه",
            "english": "No fatigue, nor disease, nor sorrow, nor sadness... befalls a Muslim, except that Allah expiates some of his sins.",
            "urdu": "جو بھی تکلیف، بیماری، غم یا دکھ کسی مسلمان کو پہنچے ... اللہ اسے اس کے گناہوں کا کفارہ بنا دیتا ہے۔",
            "reference": "Sahih Bukhari 5641, Sahih Muslim 2573"
        },
        {
            "arabic": "من لا يشكر الناس لا يشكر الله",
            "english": "Whoever does not thank people has not thanked Allah.",
            "urdu": "جو لوگوں کا شکر ادا نہیں کرتا، وہ اللہ کا بھی شکر ادا نہیں کرتا۔",
            "reference": "Sunan Tirmidhi 1954"
        },
        {
            "arabic": "طيب النفس من النعم",
            "english": "A cheerful heart is one of the blessings.",
            "urdu": "خوش مزاجی اللہ کی ایک نعمت ہے۔",
            "reference": "Sunan Ibn Majah 2141"
        }
    ],
    "pain": [
        {
            "arabic": "ما من مسلم يصاب بأذى من مرض فما سواه إلا حط الله به سيئاته كما تحط الشجرة ورقها",
            "english": "Whenever a Muslim is afflicted with a harm, sickness or otherwise, Allah will remove his sins as a tree sheds its leaves.",
            "urdu": "جب کسی مسلمان کو تکلیف یا بیماری پہنچتی ہے تو اللہ اس کے گناہ ایسے گرا دیتا ہے جیسے درخت اپنے پتے گراتا ہے۔",
            "reference": "Sahih al-Bukhari 5660"
        },
        {
            "arabic": "إِذَا أَرَادَ اللَّهُ بِعَبْدٍ خَيْرًا اصْتَحْلَاهُ",
            "english": "When Allah intends good for a servant, He afflicts him with trials.",
            "urdu": "جب اللہ کسی بندے کے ساتھ بھلا ئی کا ارادہ کرتے ہیں تو اسے آزمائش میں مبتلا کرتے ہیں۔",
            "reference": "Sahih al-Bukhari 5645"
        },
        {
            "arabic": "لَا يُصِيبُ الْمُؤْمِنَ شَوْكَةٌ فَمَا فَوْقَهَا إِلَّا رَفَعَهُ اللَّهُ بِهَا دَرَجَةً أَوْ حَطَّ عَنْهُ بِهَا خَطِيئَةً",
            "english": "No believer is afflicted with a thorn or anything greater, but Allah raises him in rank or removes a sin because of it.",
            "urdu": "کسی بھی مومن کو کانٹے یا اس سے بڑی تکلیف نہیں پہنچتی، مگر اللہ تعالیٰ اس کے ذریعے اس کا درجہ بلند کرتے ہیں یا اس سے گناہ معاف کرتے ہیں۔",
            "reference": "Sahih Muslim 2573"
  }
    ],
    "anxiety": [
        {
            "arabic": "اللهم إني أعوذ بك من الهم والحزن",
            "english": "O Allah, I seek refuge in You from anxiety and sorrow.",
            "urdu": "اے اللہ! میں تجھ سے فکرمندی اور غم سے پناہ مانگتا ہوں۔",
            "reference": "Sahih al-Bukhari 6369"
        },
        {
            "arabic": "من لا يرحم الناس لا يرحمه الله",
            "english": "Whoever does not show mercy to people, Allah will not show mercy to him.",
            "urdu": "جو لوگوں پر رحم نہیں کرتا، اللہ اس پر رحم نہیں کرے گا۔",
            "reference": "Sahih al-Bukhari 6013"
        },
        {
            "arabic": "اللهم إني أعوذ بك من الهم والحزن وأعوذ بك من العجز والكسل وأعوذ بك من الجبن والبخل وأعوذ بك من غلبة الدين وقهر الرجال",
            "english": "O Allah, I seek refuge in You from anxiety and sorrow, and I seek refuge in You from incapacity and laziness, and I seek refuge in You from cowardice and miserliness, and I seek refuge in You from the burden of debts and the oppression of men.",
            "urdu": "اے اللہ! میں تیرے پاس پریشانی اور غم سے پناہ مانگتا ہوں، اور میں تیرے پاس بے بسی اور سستی سے پناہ مانگتا ہوں، اور میں تیرے پاس بزدلی اور کنجوسی سے پناہ مانگتا ہوں، اور میں تیرے پاس قرض کی زیادتی اور لوگوں کے ظلم سے پناہ مانگتا ہوں۔",
            "reference": "Sahih al-Bukhari 6369"
        }
    ],
    "stress": [
        {
            "arabic": "اللهم لا سهل إلا ما جعلته سهلا وأنت تجعل الحزن إذا شئت سهلا",
            "english": "O Allah, there is no ease except in that which You have made easy, and You make the difficult, if You wish, easy.",
            "urdu": "اے اللہ! تیرے سوا کوئی آسانی نہیں ہے مگر وہی جو تو آسان بنا دے، اور اگر تو چاہے تو مشکل کو بھی آسان کر دے۔",
            "reference": "Ibn Hibban 970"
        },
        {
            "arabic": "ما يصيب المؤمن من هم ولا حزن ولا أذى حتى الشوكة يشاكها إلا كفر الله بها من خطاياه",
            "english": "No distress or grief befalls a believer, not even a thorn that pricks him, except that Allah expiates some of his sins because of it.",
            "urdu": "مؤمن کو جو تکلیف یا غم پہنچتا ہے، یہاں تک کہ اگر کانٹہ بھی چبھتا ہے تو اللہ اس کے ذریعے سے اس کے گناہ مٹا دیتا ہے۔",
            "reference": "Sahih al-Bukhari 5641"
        },
         {
            "arabic": "من قال: حسبي الله لا إله إلا هو عليه توكلت وهو رب العرش العظيم، سبع مرات في كل يوم وليلة، كفاه الله ما أهمه من أمره",
            "english": "Whoever says: Allah is Sufficient for me, there is no deity except Him. On Him I place my trust, and He is the Lord of the Mighty Throne, seven times in a day or night, Allah will suffice him with whatever concerns him.",
            "urdu": "جو شخص یہ کلمات روزانہ سات مرتبہ پڑھتا ہے: اللہ ہی میرے لیے کافی ہے، اس کے سوا کوئی معبود نہیں۔ میں نے اس پر توکل کیا، اور وہ عظیم عرش کا مالک ہے، اللہ تعالیٰ اس کے تمام امور میں اس کی کافی مدد کرتا ہے۔",
            "reference": "Sunan Abu Dawood 5090"
  },
    ],
    "depressed": [
        {
            "arabic": "ولا تهنوا ولا تحزنوا وأنتم الأعلون إن كنتم مؤمنين",
            "english": "So do not weaken and do not grieve, and you will be superior if you are [true] believers.",
            "urdu": "نہ کمزور ہو اور نہ غم کرو، اور تم ہی غالب رہو گے اگر تم مومن ہو۔",
            "reference": "Surah Aal-e-Imran 3:139"
        },
        {
            "arabic": "قال الله تعالى: يا ابن آدم، إنك ما دعوتني ورجوتني، غفرت لك على ما كان منك، ولا أبالي",
            "english": "Allah, the Most High, said: O son of Adam, as long as you call upon Me and put your hope in Me, I will forgive you for what you have done, and I will not mind.",
            "urdu": "اللہ تعالیٰ فرماتے ہیں: اے آدم کے بیٹے! جب تک تم مجھ سے دعا کرتے رہو گے اور مجھ سے امید رکھتے رہو گے، میں تمہارے تمام گناہوں کو معاف کرتا رہوں گا اور مجھے اس کی کوئی پرواہ نہیں۔",
            "reference": "Jami at-Tirmidhi 3540"
        },
        {
            "arabic": "ما يصيب المسلم من نصب، ولا وصب، ولا هم، ولا حزن، ولا أذى، ولا غم، حتى الشوكة يشاكها، إلا كفر الله بها من خطاياه",
            "english": "No fatigue, nor disease, nor sorrow, nor sadness, nor hurt, nor distress befalls a Muslim — even if it were the prick he receives from a thorn — but that Allah expiates some of his sins for that.",
            "urdu": "مسلمان کو جو بھی تھکن، بیماری، غم، اداسی، تکلیف یا پریشانی پہنچتی ہے، یہاں تک کہ اگر کانٹا بھی چبھے، تو اللہ تعالیٰ اس کے گناہوں کو اس کے ذریعے مٹا دیتا ہے۔",
            "reference": "Sahih al-Bukhari 5641"
        }
    ],
    "cancer":[
        {
        "arabic": "ما يزال البلاء بالمؤمن والمؤمنة في نفسه وولده وماله حتى يلقى الله وما عليه خطيئة",
        "english": "The believer is continually afflicted in his body, children, and wealth until he meets Allah without any sins remaining.",
        "urdu": "مومن کو اس کی جان، اولاد اور مال میں مسلسل آزمائش ہوتی رہتی ہے، یہاں تک کہ وہ اللہ سے اس حال میں ملتا ہے کہ اس پر کوئی گناہ باقی نہیں ہوتا۔",
        "reference": "Sunan Tirmidhi 2399"
    },
    {
        "arabic": "إن الله أنزل الداء والدواء، وجعل لكل داء دواء، فتداووا ولا تتداووا بحرام",
        "english": "Allah has sent down the disease and the cure, and He has made a cure for every disease. So seek treatment, but do not seek treatment with the unlawful.",
        "urdu": "اللہ نے ہر بیماری اور اس کا علاج نازل فرمایا ہے۔ ہر بیماری کا علاج ہے، لہٰذا علاج کرو لیکن حرام چیزوں سے علاج مت کرو۔",
        "reference": "Sunan Abu Dawud 3864"
    },
        {
        "arabic": "من يرد الله به خيرا يصب منه",
        "english": "If Allah intends good for someone, He afflicts them with trials.",
        "urdu": "جس شخص کے ساتھ اللہ بھلائی کا ارادہ فرماتا ہے، اسے آزمائش میں ڈال دیتا ہے۔",
        "reference": "Sahih al-Bukhari 5645"
    }
    ],
    "icu":[
        {
            "arabic": "ما يصيب المسلم من نصب، ولا وصب، ولا هم، ولا حزن، ولا أذى، ولا غم، حتى الشوكة يشاكها، إلا كفر الله بها من خطاياه",
            "english": "No fatigue, nor disease, nor sorrow, nor sadness, nor hurt, nor distress befalls a Muslim — even if it were the prick he receives from a thorn — but that Allah expiates some of his sins for that.",
            "urdu": "مسلمان کو جو بھی تھکن، بیماری، غم، اداسی، تکلیف یا پریشانی پہنچتی ہے، یہاں تک کہ اگر کانٹا بھی چبھے، تو اللہ تعالیٰ اس کے گناہوں کو اس کے ذریعے مٹا دیتا ہے۔",
            "reference": "Sahih al-Bukhari 5641"
        },
        {
      "arabic": "دعوة ذي النون إذ دعا وهو في بطن الحوت: لا إله إلا أنت سبحانك إني كنت من الظالمين، فإنه لم يدع بها مسلم في شيء قط إلا استجاب الله له",
      "english": "The supplication of Yunus AS when he called from the belly of the whale: There is no god but You, Glory to You; I was indeed wrong. No Muslim supplicates with this for anything, except that Allah answers him.",
      "urdu": "یونس علیہ السلام کی دعا جب انہوں نے مچھلی کے پیٹ میں پکارا کہ تیرے سوا کوئی معبود نہیں، تو پاک ہے، بے شک میں ظالموں میں سے تھا۔ جو مسلمان بھی کسی چیز کے لیے یہ دعا کرے گا، اللہ ضرور اس کی دعا قبول کرے گا۔",
      "reference": "Sunan Tirmidhi 3505"
    },
    {
      "arabic": "ما يزال البلاء بالمؤمن والمؤمنة في نفسه وولده وماله حتى يلقى الله وما عليه خطيئة",
      "english": "The believer is continually afflicted in his body, children, and wealth until he meets Allah without any sins remaining.",
      "urdu": "مومن کو اس کی جان، اولاد اور مال میں مسلسل آزمائش ہوتی رہتی ہے، یہاں تک کہ وہ اللہ سے اس حال میں ملتا ہے کہ اس پر کوئی گناہ باقی نہیں ہوتا۔",
      "reference": "Sunan Tirmidhi 2399"
    }
    ]
}
