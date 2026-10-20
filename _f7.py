import sys,importlib.util
sys.stdout.reconfigure(encoding='utf-8')
spec=importlib.util.spec_from_file_location('rl','tools/restructure_learn.py')
m=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
for t in ['KV-Cache + 动作 Chunk Batching','Sim-to-Real Gap 定量诊断','Real-to-Sim自动化建模','Wall-OSS-0.5 桌面臂零样本部署','CLF-RL','3D-aware VLA 工程化','Hand-in-the-Loop','Newton-Euler 递推算法','扩散模型：从图像生成到动作生成','定位技术']:
    print(repr(t),'->',repr(m.short_of(t)))
