// 检测内网IP是否可达，如不可达则依次尝试所有节点
const targetIP = "192.168.123.1:997";
const policyGroupName = "Intranet";
const timeoutMs = 100; // 超时设置为100ms

// 获取策略组信息
let allNodes = $surge.selectGroupDetails().groups[policyGroupName];
let currentIndex = 0;

// 测试节点函数
function testNode(index) {
  // 如果已经测试完所有节点，则回到第一个节点
  if (index >= allNodes.length) {
    console.log("所有节点均不可用，设置回第一个节点");
    $surge.setSelectGroupPolicy(policyGroupName, allNodes[0]);
    $done();
    return;
  }
  
  // 设置当前要测试的节点
  let currentNode = allNodes[index];
  $surge.setSelectGroupPolicy(policyGroupName, currentNode);
  console.log(`正在测试节点: ${currentNode} (${index + 1}/${allNodes.length})`);
  
  // 测试连通性
  $httpClient.get({
    url: `http://${targetIP}`,
    timeout: timeoutMs
  }, function(error, response, data) {
    if (error) {
      console.log(`节点 ${currentNode} 连接到 ${targetIP} 失败`);
      // 测试下一个节点
      testNode(index + 1);
    } else {
      console.log(`节点 ${currentNode} 可成功连接到 ${targetIP}，保持当前节点`);
      $done();
    }
  });
}

// 从第一个节点开始测试
testNode(0);