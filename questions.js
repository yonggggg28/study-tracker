const questions = [

    // =====================================================
    // 第三冊｜基本測量｜密度
    // =====================================================

    {
        id: "SCI-B3-DENSITY-001",

        subject: "science",
        subjectName: "理化",

        book: 3,

        unit: "measurement",
        unitName: "基本測量",

        concept: "density",
        conceptName: "密度",

        // 暫時保留，給舊 app.js 使用
        topic: "密度",

        type: "calculation",
        typeName: "計算",

        difficulty: 1,

        question:
            "某物體質量為 60 g，體積為 20 cm³，其密度為多少？",

        options: [
            "2 g/cm³",
            "3 g/cm³",
            "4 g/cm³",
            "6 g/cm³"
        ],

        answer: 1,

        explanation:
            "密度＝質量÷體積＝60÷20＝3 g/cm³。",

        requireWork: true
    },


    {
        id: "SCI-B3-DENSITY-002",

        subject: "science",
        subjectName: "理化",

        book: 3,

        unit: "measurement",
        unitName: "基本測量",

        concept: "density",
        conceptName: "密度",

        topic: "密度",

        type: "concept",
        typeName: "觀念",

        difficulty: 1,

        question:
            "將一塊均勻純物質切成兩半後，其密度如何改變？",

        options: [
            "變成一半",
            "變成兩倍",
            "保持不變",
            "無法判斷"
        ],

        answer: 2,

        explanation:
            "密度是物質的特性。切開後質量與體積同比例減少，因此密度不變。",

        requireWork: false
    },


    {
        id: "SCI-B3-DENSITY-003",

        subject: "science",
        subjectName: "理化",

        book: 3,

        unit: "measurement",
        unitName: "基本測量",

        concept: "density",
        conceptName: "密度",

        topic: "密度",

        type: "calculation",
        typeName: "計算",

        difficulty: 1,

        question:
            "某液體體積為 50 cm³，質量為 40 g，其密度為多少？",

        options: [
            "0.8 g/cm³",
            "1.25 g/cm³",
            "2 g/cm³",
            "90 g/cm³"
        ],

        answer: 0,

        explanation:
            "密度＝40÷50＝0.8 g/cm³。",

        requireWork: true
    },


    {
        id: "SCI-B3-DENSITY-004",

        subject: "science",
        subjectName: "理化",

        book: 3,

        unit: "measurement",
        unitName: "基本測量",

        concept: "density",
        conceptName: "密度",

        topic: "密度",

        type: "calculation",
        typeName: "計算",

        difficulty: 2,

        question:
            "某物質密度為 2 g/cm³，體積為 30 cm³，其質量為多少？",

        options: [
            "15 g",
            "28 g",
            "32 g",
            "60 g"
        ],

        answer: 3,

        explanation:
            "質量＝密度×體積＝2×30＝60 g。",

        requireWork: true
    },


    {
        id: "SCI-B3-DENSITY-005",

        subject: "science",
        subjectName: "理化",

        book: 3,

        unit: "measurement",
        unitName: "基本測量",

        concept: "density",
        conceptName: "密度",

        topic: "密度",

        type: "application",
        typeName: "應用",

        difficulty: 2,

        question:
            "比較相同體積的鐵塊與木塊，鐵塊質量較大，可以推論什麼？",

        options: [
            "鐵的密度較大",
            "木的密度較大",
            "兩者密度相同",
            "無法比較"
        ],

        answer: 0,

        explanation:
            "體積相同時，質量較大的物質密度較大。",

        requireWork: false
    },


    // =====================================================
    // 第三冊｜物質與溶液｜溶液
    // =====================================================

    {
        id: "SCI-B3-SOLUTION-001",

        subject: "science",
        subjectName: "理化",

        book: 3,

        unit: "matter",
        unitName: "物質與溶液",

        concept: "solution",
        conceptName: "溶質、溶劑與溶液",

        topic: "溶液",

        type: "concept",
        typeName: "觀念",

        difficulty: 1,

        question:
            "食鹽水中的食鹽稱為什麼？",

        options: [
            "溶劑",
            "溶質",
            "溶液",
            "沉澱物"
        ],

        answer: 1,

        explanation:
            "被溶解的物質稱為溶質。",

        requireWork: false
    },


    {
        id: "SCI-B3-SOLUTION-002",

        subject: "science",
        subjectName: "理化",

        book: 3,

        unit: "matter",
        unitName: "物質與溶液",

        concept: "solution",
        conceptName: "溶質、溶劑與溶液",

        topic: "溶液",

        type: "concept",
        typeName: "觀念",

        difficulty: 1,

        question:
            "食鹽水中的水通常稱為什麼？",

        options: [
            "溶質",
            "溶劑",
            "溶液",
            "晶體"
        ],

        answer: 1,

        explanation:
            "負責溶解其他物質的液體稱為溶劑。",

        requireWork: false
    },


    {
        id: "SCI-B3-SOLUTION-003",

        subject: "science",
        subjectName: "理化",

        book: 3,

        unit: "matter",
        unitName: "物質與溶液",

        concept: "solution",
        conceptName: "溶質、溶劑與溶液",

        topic: "溶液",

        type: "concept",
        typeName: "觀念",

        difficulty: 1,

        question:
            "下列何者屬於均勻的溶液？",

        options: [
            "泥水",
            "食鹽水",
            "沙與水",
            "油與水"
        ],

        answer: 1,

        explanation:
            "食鹽均勻溶解於水中，可形成均勻的溶液。",

        requireWork: false
    },


    {
        id: "SCI-B3-SOLUTION-004",

        subject: "science",
        subjectName: "理化",

        book: 3,

        unit: "matter",
        unitName: "物質與溶液",

        concept: "solubility",
        conceptName: "溶解與溶解度",

        // 舊版先歸在「溶液」
        topic: "溶液",

        type: "concept",
        typeName: "觀念",

        difficulty: 2,

        question:
            "在一定溫度下，已無法繼續溶解更多溶質的溶液稱為什麼？",

        options: [
            "稀溶液",
            "濃溶液",
            "飽和溶液",
            "純物質"
        ],

        answer: 2,

        explanation:
            "在一定溫度下不能再溶解更多溶質時，稱為飽和溶液。",

        requireWork: false
    },


    {
        id: "SCI-B3-SOLUTION-005",

        subject: "science",
        subjectName: "理化",

        book: 3,

        unit: "matter",
        unitName: "物質與溶液",

        concept: "solubility",
        conceptName: "溶解與溶解度",

        topic: "溶液",

        type: "application",
        typeName: "應用",

        difficulty: 2,

        question:
            "一般而言，要讓固體溶質在水中溶解得更快，可以採取哪一種方式？",

        options: [
            "降低溫度",
            "攪拌",
            "完全靜置",
            "加入更多相同溶質"
        ],

        answer: 1,

        explanation:
            "攪拌可以增加溶質與溶劑的接觸，有助於加快溶解速率。",

        requireWork: false
    },


    // =====================================================
    // 第三冊｜波與聲音｜聲音
    // =====================================================

    {
        id: "SCI-B3-SOUND-001",

        subject: "science",
        subjectName: "理化",

        book: 3,

        unit: "wave_sound",
        unitName: "波與聲音",

        concept: "sound_generation",
        conceptName: "聲音的產生與傳播",

        topic: "聲音",

        type: "concept",
        typeName: "觀念",

        difficulty: 1,

        question:
            "聲音無法在哪一種環境中傳播？",

        options: [
            "空氣",
            "水",
            "鋼鐵",
            "真空"
        ],

        answer: 3,

        explanation:
            "聲音需要介質傳播，因此無法在真空中傳播。",

        requireWork: false
    },


    {
        id: "SCI-B3-SOUND-002",

        subject: "science",
        subjectName: "理化",

        book: 3,

        unit: "wave_sound",
        unitName: "波與聲音",

        concept: "sound_generation",
        conceptName: "聲音的產生與傳播",

        topic: "聲音",

        type: "concept",
        typeName: "觀念",

        difficulty: 1,

        question:
            "聲音主要由物體的什麼現象產生？",

        options: [
            "振動",
            "發光",
            "升溫",
            "融化"
        ],

        answer: 0,

        explanation:
            "聲音的產生來自物體振動。",

        requireWork: false
    },


    {
        id: "SCI-B3-SOUND-003",

        subject: "science",
        subjectName: "理化",

        book: 3,

        unit: "wave_sound",
        unitName: "波與聲音",

        concept: "pitch_volume",
        conceptName: "音調與響度",

        topic: "聲音",

        type: "concept",
        typeName: "觀念",

        difficulty: 2,

        question:
            "聲音的音調高低主要與何者有關？",

        options: [
            "振幅",
            "頻率",
            "距離",
            "音量"
        ],

        answer: 1,

        explanation:
            "頻率越高，音調通常越高。",

        requireWork: false
    },


    {
        id: "SCI-B3-SOUND-004",

        subject: "science",
        subjectName: "理化",

        book: 3,

        unit: "wave_sound",
        unitName: "波與聲音",

        concept: "pitch_volume",
        conceptName: "音調與響度",

        topic: "聲音",

        type: "concept",
        typeName: "觀念",

        difficulty: 2,

        question:
            "聲音的響度主要與振動的哪項特性有關？",

        options: [
            "振幅",
            "頻率",
            "波速",
            "週期"
        ],

        answer: 0,

        explanation:
            "振幅越大，通常聲音越響亮。",

        requireWork: false
    },


    {
        id: "SCI-B3-SOUND-005",

        subject: "science",
        subjectName: "理化",

        book: 3,

        unit: "wave_sound",
        unitName: "波與聲音",

        concept: "sound_generation",
        conceptName: "聲音的產生與傳播",

        topic: "聲音",

        type: "application",
        typeName: "應用",

        difficulty: 2,

        question:
            "太空人在月球表面即使彼此靠近，也不能直接靠空氣傳聲，主要原因為何？",

        options: [
            "月球溫度太低",
            "月球幾乎沒有空氣",
            "聲音速度太快",
            "太空衣吸收所有聲音"
        ],

        answer: 1,

        explanation:
            "月球表面近似真空，缺少可供聲音傳播的介質。",

        requireWork: false
    },


    // =====================================================
    // 第三冊｜光
    // =====================================================

    {
        id: "SCI-B3-LIGHT-001",

        subject: "science",
        subjectName: "理化",

        book: 3,

        unit: "light",
        unitName: "光",

        concept: "reflection",
        conceptName: "光的反射",

        topic: "光的反射",

        type: "concept",
        typeName: "觀念",

        difficulty: 1,

        question:
            "光線照射平面鏡，若入射角為 30°，反射角為多少？",

        options: [
            "15°",
            "30°",
            "60°",
            "90°"
        ],

        answer: 1,

        explanation:
            "依反射定律，入射角等於反射角，所以反射角為30°。",

        requireWork: false
    },


    {
        id: "SCI-B3-LIGHT-002",

        subject: "science",
        subjectName: "理化",

        book: 3,

        unit: "light",
        unitName: "光",

        concept: "plane_mirror",
        conceptName: "平面鏡成像",

        topic: "光的反射",

        type: "concept",
        typeName: "觀念",

        difficulty: 1,

        question:
            "平面鏡所形成的像通常屬於哪一種？",

        options: [
            "實像",
            "虛像",
            "倒立實像",
            "無法成像"
        ],

        answer: 1,

        explanation:
            "平面鏡形成正立、等大的虛像。",

        requireWork: false
    },


    {
        id: "SCI-B3-LIGHT-003",

        subject: "science",
        subjectName: "理化",

        book: 3,

        unit: "light",
        unitName: "光",

        concept: "refraction",
        conceptName: "光的折射",

        topic: "光的反射",

        type: "concept",
        typeName: "觀念",

        difficulty: 2,

        question:
            "筷子插入水中看起來像折斷，主要與哪種現象有關？",

        options: [
            "反射",
            "折射",
            "繞射",
            "干涉"
        ],

        answer: 1,

        explanation:
            "光由水進入空氣時傳播方向發生改變，因此產生折射現象。",

        requireWork: false
    },


    {
        id: "SCI-B3-LIGHT-004",

        subject: "science",
        subjectName: "理化",

        book: 3,

        unit: "light",
        unitName: "光",

        concept: "lens",
        conceptName: "透鏡",

        topic: "光的反射",

        type: "concept",
        typeName: "觀念",

        difficulty: 2,

        question:
            "下列何種透鏡可以使平行光線會聚？",

        options: [
            "凸透鏡",
            "凹透鏡",
            "平面鏡",
            "任何玻璃"
        ],

        answer: 0,

        explanation:
            "凸透鏡具有會聚平行光線的作用。",

        requireWork: false
    },


    {
        id: "SCI-B3-LIGHT-005",

        subject: "science",
        subjectName: "理化",

        book: 3,

        unit: "light",
        unitName: "光",

        concept: "light_travel",
        conceptName: "光的直進",

        topic: "光的反射",

        type: "application",
        typeName: "應用",

        difficulty: 1,

        question:
            "影子的形成主要可以說明光具有哪一種性質？",

        options: [
            "直線前進",
            "一定會折射",
            "一定會反射",
            "只能在水中傳播"
        ],

        answer: 0,

        explanation:
            "光在均勻介質中大致沿直線前進，因此物體後方會形成影子。",

        requireWork: false
    }

];