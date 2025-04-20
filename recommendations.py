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
    "pain": [19],  
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
    "depression": [
        {"surah": 2, "ayah": 156},
        {"surah": 12, "ayah": 87},
        {"surah": 39, "ayah": 53},
        {"surah": 2, "ayah": 216},
        {"surah": 2, "ayah": 155},
        {"surah": 24, "ayah": 21}
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
            "arabic": "إنما ذلكم الشيطان يخوف أولياءه فلا تخافوهم وخافون إن كنتم مؤمنين",
            "english": "It is only Satan who frightens his followers. So fear them not, but fear Me, if you are (true) believers.",
            "urdu": "یہ تو شیطان ہی ہے جو اپنے دوستوں کو ڈراتا ہے، پس ان سے نہ ڈرو بلکہ مجھ سے ڈرو اگر تم ایمان والے ہو۔",
            "reference": "Surah Aal-e-Imran 3:175"
        },
        {
            "arabic": "من قال: حسبنا الله ونعم الوكيل كفاه الله ما أهمه",
            "english": "Whoever says: |Allah is Sufficient for us, and He is the Best Disposer of affairs|, Allah will suffice him.",
            "urdu": "جو کہے: اللہ ہمیں کافی ہے اور وہی بہترین کارساز ہے، اللہ اسے کافی ہو جاتا ہے۔",
            "reference": "Sahih al-Bukhari 4563"
        }
    ],
    "surprise": [
        {
            "arabic": "عجبا لأمر المؤمن، إن أمره كله خير",
            "english": "Wondrous is the affair of the believer, for there is good for him in every matter.",
            "urdu": "مومن کا معاملہ بھی عجیب ہے! اس کے تمام معاملات میں بھلائی ہے۔",
            "reference": "Sahih Muslim 2999"
        }
    ],
    "disgust": [
        {
            "arabic": "إن الله طيب لا يقبل إلا طيبا",
            "english": "Allah is pure and accepts only that which is pure.",
            "urdu": "بیشک اللہ پاک ہے اور صرف پاک چیز کو قبول فرماتا ہے۔",
            "reference": "Sahih Muslim 1015"
        }
    ],
    "neutral": [
        {
            "arabic": "ما يصيب المسلم من نصب ولا وصب ... إلا كفر الله بها من خطاياه",
            "english": "No fatigue, nor disease, nor sorrow, nor sadness... befalls a Muslim, except that Allah expiates some of his sins.",
            "urdu": "جو بھی تکلیف، بیماری، غم یا دکھ کسی مسلمان کو پہنچے ... اللہ اسے اس کے گناہوں کا کفارہ بنا دیتا ہے۔",
            "reference": "Sahih Bukhari 5641, Sahih Muslim 2573"
        }
    ],
    "pain": [
        {
            "arabic": "ما من مسلم يصاب بأذى من مرض فما سواه إلا حط الله به سيئاته كما تحط الشجرة ورقها",
            "english": "Whenever a Muslim is afflicted with a harm, sickness or otherwise, Allah will remove his sins as a tree sheds its leaves.",
            "urdu": "جب کسی مسلمان کو تکلیف یا بیماری پہنچتی ہے تو اللہ اس کے گناہ ایسے گرا دیتا ہے جیسے درخت اپنے پتے گراتا ہے۔",
            "reference": "Sahih al-Bukhari 5660"
        }
    ],
    "anxiety": [
        {
            "arabic": "اللهم إني أعوذ بك من الهم والحزن",
            "english": "O Allah, I seek refuge in You from anxiety and sorrow.",
            "urdu": "اے اللہ! میں تجھ سے فکرمندی اور غم سے پناہ مانگتا ہوں۔",
            "reference": "Sahih al-Bukhari 6369"
        }
    ],
    "stress": [
        {
            "arabic": "اللهم لا سهل إلا ما جعلته سهلا وأنت تجعل الحزن إذا شئت سهلا",
            "english": "O Allah, there is no ease except in that which You have made easy, and You make the difficult, if You wish, easy.",
            "urdu": "اے اللہ! تیرے سوا کوئی آسانی نہیں ہے مگر وہی جو تو آسان بنا دے، اور اگر تو چاہے تو مشکل کو بھی آسان کر دے۔",
            "reference": "Ibn Hibban 970"
        }
    ],
    "depression": [
        {
            "arabic": "ولا تهنوا ولا تحزنوا وأنتم الأعلون إن كنتم مؤمنين",
            "english": "So do not weaken and do not grieve, and you will be superior if you are [true] believers.",
            "urdu": "نہ کمزور ہو اور نہ غم کرو، اور تم ہی غالب رہو گے اگر تم مومن ہو۔",
            "reference": "Surah Aal-e-Imran 3:139"
        }
    ]
}
