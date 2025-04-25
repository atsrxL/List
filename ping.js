// 检测内网IP是否可达，如不可达则切换策略组
const targetIP = "192.168.123.1:997";
const policyGroupName = "Intranet";
const timeoutSeconds = 2; // 超时设置为2秒

// 定义主函数，将在event触发时执行
function testAndSwitch() {
  // 获取策略组信息
  let allNodes = $surge.selectGroupDetails().groups[policyGroupName];
  let currentNode = $surge.selectGroupDetails().decisions[policyGroupName];
  
  console.log(`开始检测，当前节点: ${currentNode}`);
  
  // 从第一个节点开始测试
  testNode(0, allNodes);
}

// 测试特定节点
function testNode(index, allNodes) {
  if (index >= allNodes.length) {
    console.log("所有节点都已测试，没有可用节点");
    $done();
    return;
  }
  
  let nodeToTest = allNodes[index];
  
  // 先切换到要测试的节点
  $surge.setSelectGroupPolicy(policyGroupName, nodeToTest);
  console.log(`正在测试节点: ${nodeToTest}`);
  
  // 等待短暂时间让策略生效
  setTimeout(() => {
    $httpClient.get({
      url: `http://${targetIP}`,
      timeout: timeoutSeconds * 1000 // 转换为毫秒
    }, function(error, response, data) {
      if (error) {
        console.log(`${targetIP} 通过节点 ${nodeToTest} 不可达`);
        // 测试下一个节点
        testNode(index + 1, allNodes);
      } else {
        console.log(`${targetIP} 通过节点 ${nodeToTest} 可达，使用此节点`);
        $done();
      }
    });
  }, 500); // 给500毫秒的时间让策略生效
}

// 开始执行
testAndSwitch();