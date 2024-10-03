export default {
  async fetch(request) {
    let url = new URL(request.url);
    
    // 替换当前域名为目标域名 pomf2.lain.la
    let targetUrl = new URL(request.url.replace(url.hostname, 'pomf2.lain.la'));
    
    // 构建代理请求，保留原始请求的所有方法、头部等信息
    let modifiedRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'follow'
    });
    
    // 获取目标服务器的响应
    let response = await fetch(modifiedRequest);

    // 检查是否为流媒体响应（根据 MIME 类型判断），如果是则直接返回流式传输的 body
    if (response.headers.get('Content-Type').includes('video') || 
        response.headers.get('Content-Type').includes('audio')) {
      
      // 确保 Range 请求能够正常处理，并传递所有相关头部信息
      return new Response(response.body, {
        headers: {
          ...response.headers,
          'Access-Control-Allow-Origin': '*',  // 允许跨域
          'Accept-Ranges': 'bytes',            // 支持 Range 请求
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': response.headers.get('Content-Type') // 保留正确的 Content-Type
        },
        status: response.status,
        statusText: response.statusText
      });
    }

    // 非流媒体的情况，处理 HTML/文本内容替换
    let text = await response.text();
    let updatedText = text.replace(/pomf2\.lain\.la/g, url.hostname);

    return new Response(updatedText, {
      headers: {
        ...response.headers,
        'Access-Control-Allow-Origin': '*',  // 允许跨域
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
      status: response.status,
      statusText: response.statusText
    });
  }
}
