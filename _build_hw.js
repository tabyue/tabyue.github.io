const fs = require('fs');
const data = {
  "lastUpdated": "2026-04-18",
  "categories": [
    {"id": "all", "name": "全部", "icon": "🔩"},
    {"id": "humanoid", "name": "人形机器人", "icon": "🤖"},
    {"id": "quadruped", "name": "四足机器人", "icon": "🐕"},
    {"id": "arm", "name": "机械臂", "icon": "🦾"},
    {"id": "hand", "name": "灵巧手", "icon": "🤚"},
    {"id": "mobile", "name": "移动底盘", "icon": "🛞"},
    {"id": "sensor", "name": "传感器模组", "icon": "📡"}
  ],
  "robots": [
    {
      "id": "unitree-g1",
      "name": "Unitree G1",
      "manufacturer": "宇树科技",
      "category": "humanoid",
      "tags": ["人形", "开源SDK", "23DOF", "研究级"],
      "price": "¥69,000 起",
      "image": "",
      "overview": "宇树 G1 是一款面向教育和研究的紧凑型人形机器人，身高 127cm，体重约 35kg。配备 23-43 个自由度（可选配灵巧手），支持 Python/C++ SDK 二次开发。2025年起成为具身智能研究的主流平台之一。",
      "specs": {
        "身高": "127 cm",
        "体重": "约 35 kg",
        "自由度": "23 DoF (基础) / 43 DoF (含灵巧手)",
        "步行速度": "≥ 2 m/s",
        "续航": "约 1-2 小时",
        "算力平台": "NVIDIA Jetson Orin NX (16GB)"
      },
      "bom": [
        {"part": "关节电机 (肩/髋)", "model": "宇树 M107 定制电机", "specs": "峰值扭矩 120Nm, 内置 FOC + 19bit 编码器", "qty": "12", "price": "非零售", "link": "https://support.unitree.com/home/en/G1_developer", "driver": "Unitree SDK2 (Python/C++)"},
        {"part": "关节电机 (肘/膝)", "model": "宇树定制无刷电机", "specs": "峰值扭矩 60Nm, 谐波减速器", "qty": "8", "price": "非零售", "link": "https://support.unitree.com/home/en/G1_developer", "driver": "Unitree SDK2"},
        {"part": "腕部关节", "model": "宇树定制舵机", "specs": "3 DoF 腕关节", "qty": "2-6", "price": "非零售", "link": "", "driver": "Unitree SDK2"},
        {"part": "主控计算机", "model": "NVIDIA Jetson Orin NX 16GB", "specs": "100 TOPS INT8, 8核 ARM A78AE, 16GB LPDDR5", "qty": "1", "price": "~¥3,500", "link": "https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-orin/", "driver": "JetPack 6.x"},
        {"part": "IMU", "model": "ICM-42688-P", "specs": "6轴, ±2000°/s, ±16g, SPI 8kHz", "qty": "1", "price": "~¥30", "link": "https://invensense.tdk.com/products/motion-tracking/6-axis/icm-42688-p/", "driver": "SPI / Unitree SDK"},
        {"part": "深度相机", "model": "Intel RealSense D435", "specs": "RGB 1920×1080 + 深度 1280×720, USB3", "qty": "1", "price": "~¥1,800", "link": "https://www.intelrealsense.com/depth-camera-d435/", "driver": "librealsense2"},
        {"part": "3D LiDAR", "model": "Livox Mid-360", "specs": "非重复扫描, 40m测程, 200K pts/s", "qty": "1 (选配)", "price": "~¥3,800", "link": "https://www.livoxtech.com/mid-360", "driver": "Livox SDK2 / ROS2"},
        {"part": "电池", "model": "定制锂电池组", "specs": "48V, ~30Ah", "qty": "1", "price": "非零售", "link": "", "driver": "BMS 内置"},
        {"part": "灵巧手", "model": "宇树 Dex3-1 (选配)", "specs": "每手 10 DoF, 力控夹持", "qty": "0-2", "price": "选配", "link": "https://support.unitree.com/home/en/G1_developer", "driver": "Unitree SDK2"}
      ],
      "docs": [
        {"name": "官方开发者文档", "url": "https://support.unitree.com/home/en/G1_developer"},
        {"name": "Unitree SDK2 GitHub", "url": "https://github.com/unitreerobotics/unitree_sdk2"},
        {"name": "G1 URDF 模型", "url": "https://github.com/unitreerobotics/unitree_ros2"},
        {"name": "G1 拆解分析 (LinkedIn)", "url": "https://www.linkedin.com/pulse/inside-unitrees-g1-robot-what-teardown-reveals-future-re79c"}
      ],
      "addedDate": "2026-04-18"
    },
    {
      "id": "unitree-h1",
      "name": "Unitree H1",
      "manufacturer": "宇树科技",
      "category": "humanoid",
      "tags": ["人形", "高性能", "冲刺10m/s", "研究级"],
      "price": "¥650,000 起",
      "image": "",
      "overview": "宇树 H1 是一款全尺寸高性能人形机器人，身高 180cm，体重约 47kg。搭载自研 M107 关节电机，2026年冲刺速度突破 10m/s 世界纪录。面向高端研究和商业应用。",
      "specs": {
        "身高": "180 cm",
        "体重": "约 47 kg",
        "自由度": "19 DoF",
        "步行速度": "≥ 3.3 m/s (冲刺 10 m/s)",
        "续航": "约 2 小时",
        "算力平台": "NVIDIA Jetson AGX Orin 64GB"
      },
      "bom": [
        {"part": "关节电机", "model": "宇树 M107", "specs": "峰值扭矩 360Nm, 内置 FOC + 编码器 + 减速器", "qty": "19", "price": "非零售", "link": "https://support.unitree.com/home/en/H1_developer", "driver": "Unitree SDK2"},
        {"part": "主控计算机", "model": "NVIDIA Jetson AGX Orin 64GB", "specs": "275 TOPS INT8, 12核 ARM A78AE, 64GB", "qty": "1", "price": "~¥12,000", "link": "https://www.nvidia.com/en-us/autonomous-machines/embedded-systems/jetson-orin/", "driver": "JetPack 6.x"},
        {"part": "IMU", "model": "ICM-42688-P", "specs": "6轴, ±2000°/s, ±16g", "qty": "1", "price": "~¥30", "link": "", "driver": "SPI"},
        {"part": "3D LiDAR", "model": "Livox Mid-360", "specs": "非重复扫描, 40m", "qty": "1", "price": "~¥3,800", "link": "https://www.livoxtech.com/mid-360", "driver": "Livox SDK2"},
        {"part": "深度相机", "model": "Intel RealSense D435i", "specs": "RGB+深度+IMU", "qty": "1", "price": "~¥2,200", "link": "", "driver": "librealsense2"},
        {"part": "电池", "model": "定制锂电池", "specs": "48V, 大容量", "qty": "1", "price": "非零售", "link": "", "driver": "BMS 内置"}
      ],
      "docs": [
        {"name": "官方开发者文档", "url": "https://support.unitree.com/home/en/H1_developer"},
        {"name": "Unitree SDK2 GitHub", "url": "https://github.com/unitreerobotics/unitree_sdk2"}
      ],
      "addedDate": "2026-04-18"
    },
    {
      "id": "unitree-go2",
      "name": "Unitree Go2",
      "manufacturer": "宇树科技",
      "category": "quadruped",
      "tags": ["四足", "消费级", "AI模式", "热门"],
      "price": "¥9,997 起",
      "image": "",
      "overview": "宇树 Go2 是目前最受欢迎的消费级/教育级四足机器人，12 自由度，支持 AI 模式（内置 GPT 语音交互）。从 Air 到 EDU 多个版本，EDU 版开放 SDK 二次开发。",
      "specs": {
        "体重": "15 kg",
        "尺寸": "70×31×40 cm (站立)",
        "自由度": "12 DoF (每腿 3 关节)",
        "负载": "3-8 kg (版本不同)",
        "速度": "≥ 3.5 m/s",
        "续航": "1-2 小时"
      },
      "bom": [
        {"part": "关节电机", "model": "宇树 GO-M8010-6", "specs": "峰值扭矩 23.7Nm, 减速比 6.33:1, 内置编码器", "qty": "12", "price": "~¥800/个", "link": "https://www.unitree.com/go1/motor/", "driver": "CAN / Unitree SDK"},
        {"part": "主控 (EDU版)", "model": "NVIDIA Jetson Orin Nano/NX", "specs": "40-100 TOPS", "qty": "1", "price": "¥1,500-3,500", "link": "", "driver": "JetPack 6.x"},
        {"part": "IMU", "model": "BMI088", "specs": "6轴, 工业级", "qty": "1", "price": "~¥50", "link": "", "driver": "SPI"},
        {"part": "2D LiDAR", "model": "集成式 (EDU+版)", "specs": "360°扫描", "qty": "0-1", "price": "内含", "link": "", "driver": "Unitree SDK"},
        {"part": "深度相机", "model": "Intel RealSense D435", "specs": "RGB+深度", "qty": "0-1", "price": "~¥1,800", "link": "", "driver": "librealsense2"},
        {"part": "超声波传感器", "model": "集成式", "specs": "前方避障", "qty": "2", "price": "内含", "link": "", "driver": "内置"},
        {"part": "电池", "model": "定制锂电池", "specs": "28.8V, 8000mAh", "qty": "1", "price": "~¥800", "link": "", "driver": "BMS"}
      ],
      "docs": [
        {"name": "官方文档中心", "url": "https://support.unitree.com/main/zh"},
        {"name": "Go2 拆解分析", "url": "https://www.simplexitypd.com/blog/unitree-go2-motor-teardown/"},
        {"name": "Unitree SDK2", "url": "https://github.com/unitreerobotics/unitree_sdk2"}
      ],
      "addedDate": "2026-04-18"
    },
    {
      "id": "unitree-b2",
      "name": "Unitree B2",
      "manufacturer": "宇树科技",
      "category": "quadruped",
      "tags": ["四足", "工业级", "大负载", "户外"],
      "price": "约 ¥400,000",
      "image": "",
      "overview": "宇树 B2 是面向工业场景的大型四足机器人，体重约 60kg，负载可达 40kg。采用液压-电机混合驱动，适合巡检、测绘、搜救等户外任务。",
      "specs": {
        "体重": "~60 kg",
        "自由度": "12 DoF",
        "负载": "40 kg",
        "速度": "≥ 6 m/s",
        "续航": "4-6 小时",
        "防护等级": "IP67"
      },
      "bom": [
        {"part": "关节电机", "model": "宇树定制大扭矩电机", "specs": "峰值扭矩 >200Nm", "qty": "12", "price": "非零售", "link": "", "driver": "Unitree SDK"},
        {"part": "主控", "model": "NVIDIA Jetson AGX Orin", "specs": "275 TOPS", "qty": "1", "price": "~¥12,000", "link": "", "driver": "JetPack"},
        {"part": "3D LiDAR", "model": "Hesai XT32 / Livox", "specs": "32线, 120m", "qty": "1", "price": "~¥10,000", "link": "", "driver": "ROS2"}
      ],
      "docs": [
        {"name": "官方文档", "url": "https://support.unitree.com/main/zh"}
      ],
      "addedDate": "2026-04-18"
    },
    {
      "id": "so-100",
      "name": "SO-100 / SO-101",
      "manufacturer": "TheRobotStudio / LeRobot",
      "category": "arm",
      "tags": ["机械臂", "开源", "低成本", "LeRobot", "入门首选"],
      "price": "~$110 (¥800)",
      "image": "",
      "overview": "SO-100 是 LeRobot 官方推荐的入门级开源机械臂，5 自由度 + 夹爪，采用 3D 打印结构 + STS3215 总线舵机。BOM 成本约 $110，是模仿学习（ACT/Diffusion Policy）训练的最佳入门硬件。SO-101 为改进版。",
      "specs": {
        "自由度": "5 DoF + 1 夹爪",
        "工作半径": "~28 cm",
        "负载": "~200 g",
        "通信": "TTL 串口 (半双工)",
        "供电": "5-7.4V",
        "重量": "~400 g"
      },
      "bom": [
        {"part": "总线舵机", "model": "飞特 STS3215", "specs": "30kg·cm, 360°, 12bit 编码器, TTL 总线", "qty": "6", "price": "~¥60/个", "link": "https://www.feetechrc.com/", "driver": "LeRobot feetech.py"},
        {"part": "舵机驱动板", "model": "飞特 SCS Debug Board", "specs": "USB-TTL 转接, 半双工串口", "qty": "1", "price": "~¥30", "link": "", "driver": "pyserial / LeRobot"},
        {"part": "3D 打印件", "model": "SO-100 STL 文件", "specs": "PLA/PETG, ~8小时打印, FDM 即可", "qty": "1套", "price": "~¥30 (材料费)", "link": "https://github.com/TheRobotStudio/SO-ARM100", "driver": "-"},
        {"part": "螺丝套件", "model": "M2/M2.5/M3 螺丝+螺母", "specs": "配套组装", "qty": "1套", "price": "~¥15", "link": "", "driver": "-"},
        {"part": "USB 线", "model": "USB-A to Micro-USB", "specs": "数据+供电", "qty": "1", "price": "~¥10", "link": "", "driver": "-"},
        {"part": "电源", "model": "5V 3A 或 7.4V 2S 锂电池", "specs": "为舵机供电", "qty": "1", "price": "~¥30-60", "link": "", "driver": "-"}
      ],
      "docs": [
        {"name": "LeRobot SO-100 教程", "url": "https://huggingface.co/docs/lerobot/so100"},
        {"name": "SO-ARM100 GitHub (STL+BOM)", "url": "https://github.com/TheRobotStudio/SO-ARM100"},
        {"name": "BOM 清单 (DeepWiki)", "url": "https://deepwiki.com/TheRobotStudio/SO-ARM100/2.2-core-components-and-bill-of-materials"},
        {"name": "Seeed Studio Wiki 教程", "url": "https://wiki.seeedstudio.com/cn/lerobot_so100m/"}
      ],
      "addedDate": "2026-04-18"
    },
    {
      "id": "aloha-2",
      "name": "ALOHA 2 (双臂遥操作)",
      "manufacturer": "Google DeepMind / Trossen Robotics",
      "category": "arm",
      "tags": ["双臂", "遥操作", "研究级", "ACT"],
      "price": "~$35,000 (¥250,000)",
      "image": "",
      "overview": "ALOHA 2 是 Google DeepMind 开源的双臂遥操作平台，4 台 WidowX-250s 6DoF 机械臂（2 leader + 2 follower），配合 ACT 算法可实现精细双臂操作。是当前学术界双臂研究的标杆硬件。",
      "specs": {
        "臂数": "4 (2 leader + 2 follower)",
        "每臂 DoF": "6 DoF + 夹爪",
        "工作半径": "65 cm",
        "负载": "250 g (每臂)",
        "通信": "Dynamixel Protocol 2.0 (USB)",
        "帧率": "50 Hz"
      },
      "bom": [
        {"part": "机械臂", "model": "Trossen WidowX-250s 6DoF (ALOHA版)", "specs": "6 DoF, Dynamixel XM/XL 舵机, 铝合金结构", "qty": "4", "price": "~$5,000/台", "link": "https://www.trossenrobotics.com/aloha.aspx", "driver": "Interbotix SDK / ROS2"},
        {"part": "舵机 (肩/肘)", "model": "Dynamixel XM540-W270", "specs": "10.6Nm, 4096分辨率, RS-485", "qty": "若干", "price": "~$350/个", "link": "https://www.robotis.us/dynamixel-xm540-w270-r/", "driver": "Dynamixel SDK"},
        {"part": "舵机 (腕)", "model": "Dynamixel XM430-W350", "specs": "4.1Nm, 4096分辨率", "qty": "若干", "price": "~$230/个", "link": "", "driver": "Dynamixel SDK"},
        {"part": "相机", "model": "Logitech C922 / Intel RealSense", "specs": "1080p@30fps / RGB-D", "qty": "2-4", "price": "¥400-1,800/个", "link": "", "driver": "OpenCV / librealsense2"},
        {"part": "铝型材框架", "model": "8020 铝型材 + 定制支架", "specs": "整体支撑结构", "qty": "1套", "price": "~$2,000", "link": "https://github.com/tonyzhaozh/aloha", "driver": "-"},
        {"part": "控制电脑", "model": "台式机 + GPU", "specs": "推荐 RTX 3090/4090, 用于训练和推理", "qty": "1", "price": "¥15,000+", "link": "", "driver": "Ubuntu 22.04 + ROS2"}
      ],
      "docs": [
        {"name": "ALOHA 2 论文", "url": "https://arxiv.org/abs/2405.02292"},
        {"name": "ALOHA GitHub (Tony Zhao)", "url": "https://github.com/tonyzhaozh/aloha"},
        {"name": "Trossen ALOHA 产品页", "url": "https://www.trossenrobotics.com/aloha.aspx"},
        {"name": "Mobile ALOHA 搭建指南", "url": "https://blog.yanghong.dev/mobile-aloha-hw/"}
      ],
      "addedDate": "2026-04-18"
    },
    {
      "id": "koch-v1-1",
      "name": "Koch v1.1",
      "manufacturer": "Alexander Koch / Jess Moss",
      "category": "arm",
      "tags": ["机械臂", "开源", "低成本", "3D打印"],
      "price": "~$150 (¥1,100)",
      "image": "",
      "overview": "Koch v1.1 是 Alexander Koch 设计的低成本开源机械臂的改进版，6 DoF + 夹爪，全 3D 打印结构。LeRobot 兼容。BOM 成本约 $150，适合入门和教育。",
      "specs": {
        "自由度": "6 DoF + 夹爪",
        "工作半径": "~35 cm",
        "负载": "~300 g",
        "通信": "TTL 串口",
        "材料": "3D 打印 PLA"
      },
      "bom": [
        {"part": "总线舵机", "model": "飞特 STS3215", "specs": "30kg·cm, TTL 总线", "qty": "7", "price": "~¥60/个", "link": "", "driver": "LeRobot"},
        {"part": "驱动板", "model": "飞特 SCS Debug Board", "specs": "USB-TTL", "qty": "1", "price": "~¥30", "link": "", "driver": "pyserial"},
        {"part": "3D 打印件", "model": "Koch v1.1 STL", "specs": "PLA, ~10小时", "qty": "1套", "price": "~¥40", "link": "https://github.com/jess-moss/koch-v1-1", "driver": "-"}
      ],
      "docs": [
        {"name": "Koch v1.1 GitHub", "url": "https://github.com/jess-moss/koch-v1-1"},
        {"name": "LeRobot Koch 教程", "url": "https://huggingface.co/docs/lerobot/en/koch"}
      ],
      "addedDate": "2026-04-18"
    },
    {
      "id": "franka-emika",
      "name": "Franka Research 3",
      "manufacturer": "Franka Robotics",
      "category": "arm",
      "tags": ["协作臂", "力控", "7DoF", "研究标杆"],
      "price": "~€30,000 (¥230,000)",
      "image": "",
      "overview": "Franka Research 3（原 Panda）是学术界最广泛使用的力控协作臂，7 DoF，每个关节内置力矩传感器。支持 1kHz 实时控制，是模仿学习、力控操作等研究的标准平台。",
      "specs": {
        "自由度": "7 DoF",
        "工作半径": "855 mm",
        "负载": "3 kg",
        "重复精度": "±0.1 mm",
        "关节力矩传感": "每关节内置",
        "控制频率": "1 kHz 实时"
      },
      "bom": [
        {"part": "关节电机+减速器", "model": "定制 BLDC + 谐波减速器", "specs": "每关节含力矩传感器, 7个关节", "qty": "7", "price": "一体化", "link": "", "driver": "libfranka"},
        {"part": "力矩传感器", "model": "关节内置应变片式", "specs": "每关节独立, ±87-12Nm", "qty": "7", "price": "内含", "link": "", "driver": "libfranka 1kHz"},
        {"part": "夹爪", "model": "Franka Hand", "specs": "平行夹爪, 行程 80mm, 力控", "qty": "1", "price": "~€5,000", "link": "", "driver": "libfranka"},
        {"part": "控制柜", "model": "Franka Control", "specs": "实时Linux, EtherCAT通信", "qty": "1", "price": "内含", "link": "", "driver": "libfranka + ROS2"}
      ],
      "docs": [
        {"name": "Franka 官方文档", "url": "https://frankaemika.github.io/docs/"},
        {"name": "libfranka GitHub", "url": "https://github.com/frankaemika/libfranka"},
        {"name": "franka_ros2", "url": "https://github.com/frankaemika/franka_ros2"}
      ],
      "addedDate": "2026-04-18"
    },
    {
      "id": "leap-hand",
      "name": "LEAP Hand",
      "manufacturer": "CMU / LEAP Robotics",
      "category": "hand",
      "tags": ["灵巧手", "开源", "16DoF", "直驱"],
      "price": "~$2,000 (¥14,000 DIY)",
      "image": "",
      "overview": "LEAP Hand 是 CMU 开源的 16 DoF 灵巧手，采用 Dynamixel 直驱电机，全开源（机械设计+URDF+控制代码）。可安装在各类机械臂末端，用于灵巧操作研究。",
      "specs": {
        "自由度": "16 DoF (4指×4关节)",
        "驱动": "直驱电机 (Dynamixel XC330)",
        "握力": "~5N",
        "重量": "~700 g",
        "通信": "Dynamixel Protocol 2.0 (USB)"
      },
      "bom": [
        {"part": "舵机", "model": "Dynamixel XC330-M288-T", "specs": "0.93Nm, 4096分辨率, TTL", "qty": "16", "price": "~$60/个", "link": "https://www.robotis.us/dynamixel-xc330-m288-t/", "driver": "Dynamixel SDK"},
        {"part": "3D 打印件", "model": "LEAP Hand STL", "specs": "SLA打印推荐(高精度)", "qty": "1套", "price": "~$200", "link": "https://leaphand.com/", "driver": "-"},
        {"part": "U2D2 通信板", "model": "Robotis U2D2", "specs": "USB ↔ Dynamixel TTL/RS-485", "qty": "1", "price": "~$50", "link": "", "driver": "Dynamixel SDK"}
      ],
      "docs": [
        {"name": "LEAP Hand 官网", "url": "https://leaphand.com/"},
        {"name": "GitHub 仓库", "url": "https://github.com/leap-hand/LEAP_Hand_API"},
        {"name": "论文 (RSS 2023)", "url": "https://arxiv.org/abs/2309.14975"}
      ],
      "addedDate": "2026-04-18"
    },
    {
      "id": "gello",
      "name": "GELLO 遥操作杆",
      "manufacturer": "UC Berkeley",
      "category": "arm",
      "tags": ["遥操作", "开源", "低成本", "通用"],
      "price": "~$500 (¥3,500 DIY)",
      "image": "",
      "overview": "GELLO 是 UC Berkeley 开源的通用低成本遥操作装置，与目标机械臂运动学 1:1 映射。支持 Franka/UR5/xArm 等多种机械臂。比 ALOHA 的 leader 臂便宜得多，适合独立研究者。",
      "specs": {
        "适配臂": "Franka / UR5 / xArm / 自定义",
        "自由度": "与目标臂一致 (6-7 DoF)",
        "映射方式": "运动学 1:1 映射",
        "通信": "USB (Dynamixel)"
      },
      "bom": [
        {"part": "舵机", "model": "Dynamixel XL330-M288/XL430", "specs": "低扭矩, 作为编码器使用", "qty": "6-7", "price": "~$24-50/个", "link": "", "driver": "Dynamixel SDK"},
        {"part": "3D 打印件", "model": "GELLO STL (对应目标臂)", "specs": "PLA/PETG", "qty": "1套", "price": "~$50", "link": "https://github.com/wuphilipp/gello_software", "driver": "-"},
        {"part": "U2D2 通信板", "model": "Robotis U2D2", "specs": "USB-Dynamixel", "qty": "1", "price": "~$50", "link": "", "driver": "Dynamixel SDK"}
      ],
      "docs": [
        {"name": "GELLO 项目主页", "url": "https://wuphilipp.github.io/gello_site/"},
        {"name": "GitHub 仓库", "url": "https://github.com/wuphilipp/gello_software"},
        {"name": "论文", "url": "https://arxiv.org/abs/2309.13037"}
      ],
      "addedDate": "2026-04-18"
    },
    {
      "id": "turtlebot3",
      "name": "TurtleBot3 Waffle Pi",
      "manufacturer": "ROBOTIS",
      "category": "mobile",
      "tags": ["移动底盘", "ROS2", "SLAM", "教育"],
      "price": "~$1,800 (¥13,000)",
      "image": "",
      "overview": "TurtleBot3 是 ROS2 生态中最经典的教育/研究移动机器人，差速驱动，搭载 2D LiDAR + Raspberry Pi/OpenCR。Nav2 导航、SLAM 建图的标准教学平台。",
      "specs": {
        "驱动": "差速驱动 (2 Dynamixel + 1 万向轮)",
        "尺寸": "281×306×141 mm",
        "重量": "1.8 kg",
        "负载": "15 kg",
        "速度": "0.26 m/s",
        "续航": "~2.5 小时"
      },
      "bom": [
        {"part": "驱动电机", "model": "Dynamixel XM430-W210", "specs": "2.7Nm, 4096分辨率", "qty": "2", "price": "~$200/个", "link": "", "driver": "Dynamixel SDK"},
        {"part": "2D LiDAR", "model": "LDS-02 (360° LiDAR)", "specs": "5Hz, 0.12-3.5m", "qty": "1", "price": "~$100", "link": "", "driver": "ROS2 lds_driver"},
        {"part": "单板计算机", "model": "Raspberry Pi 4B (4GB)", "specs": "4核 ARM, 4GB RAM", "qty": "1", "price": "~¥400", "link": "", "driver": "Ubuntu 22.04 + ROS2"},
        {"part": "控制板", "model": "OpenCR 1.0", "specs": "STM32F7, IMU内置, 电机驱动", "qty": "1", "price": "~$200", "link": "", "driver": "ROS2 opencr_node"},
        {"part": "电池", "model": "LiPo 11.1V 1800mAh", "specs": "3S", "qty": "1", "price": "~¥150", "link": "", "driver": "BMS"}
      ],
      "docs": [
        {"name": "TurtleBot3 官方文档", "url": "https://emanual.robotis.com/docs/en/platform/turtlebot3/overview/"},
        {"name": "Nav2 导航文档", "url": "https://navigation.ros.org/"},
        {"name": "SLAM Toolbox", "url": "https://github.com/SteveMacenski/slam_toolbox"}
      ],
      "addedDate": "2026-04-18"
    },
    {
      "id": "realsense-kit",
      "name": "Intel RealSense 视觉套件",
      "manufacturer": "Intel",
      "category": "sensor",
      "tags": ["深度相机", "RGB-D", "通用"],
      "price": "¥1,200 - ¥3,500",
      "image": "",
      "overview": "Intel RealSense 是具身智能领域使用最广泛的深度相机系列。D405（近场手眼）、D435（通用）、D455（远场）覆盖不同场景需求。",
      "specs": {
        "系列": "D405 / D435 / D435i / D455",
        "深度技术": "主动红外立体",
        "RGB": "最高 1920×1080",
        "深度": "最高 1280×720, 最近 10cm (D405)",
        "接口": "USB 3.2",
        "SDK": "librealsense2 (Python/C++/ROS2)"
      },
      "bom": [
        {"part": "D405 (近场)", "model": "Intel RealSense D405", "specs": "最近 10cm, 适合手眼抓取", "qty": "-", "price": "~¥1,200", "link": "https://www.intelrealsense.com/depth-camera-d405/", "driver": "librealsense2"},
        {"part": "D435 (通用)", "model": "Intel RealSense D435", "specs": "0.3-3m, 最常用", "qty": "-", "price": "~¥1,800", "link": "https://www.intelrealsense.com/depth-camera-d435/", "driver": "librealsense2"},
        {"part": "D435i (含IMU)", "model": "Intel RealSense D435i", "specs": "D435 + BMI055 IMU", "qty": "-", "price": "~¥2,200", "link": "https://www.intelrealsense.com/depth-camera-d435i/", "driver": "librealsense2"},
        {"part": "D455 (远场)", "model": "Intel RealSense D455", "specs": "0.4-6m, 基线 95mm", "qty": "-", "price": "~¥3,500", "link": "https://www.intelrealsense.com/depth-camera-d455/", "driver": "librealsense2"}
      ],
      "docs": [
        {"name": "librealsense GitHub", "url": "https://github.com/IntelRealSense/librealsense"},
        {"name": "realsense-ros (ROS2)", "url": "https://github.com/IntelRealSense/realsense-ros"},
        {"name": "Python 示例", "url": "https://github.com/IntelRealSense/librealsense/tree/master/wrappers/python/examples"}
      ],
      "addedDate": "2026-04-18"
    }
  ]
};

fs.writeFileSync('data/hardware.json', JSON.stringify(data, null, 2), 'utf8');
console.log('OK, robots:', data.robots.length, ', size:', JSON.stringify(data, null, 2).length);
