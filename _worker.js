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

    // 获取响应类型
    let contentType = response.headers.get('Content-Type') || '';

    // 如果是流媒体文件，直接返回流式传输的 body
    if (contentType.includes('video') || contentType.includes('audio')) {
      // 确保 Range 请求和响应能够正常处理
      return new Response(response.body, {
        headers: {
          ...response.headers,
          'Access-Control-Allow-Origin': '*',  // 允许跨域
          'Accept-Ranges': 'bytes',            // 支持 Range 请求
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        },
        status: response.status,
        statusText: response.statusText
      });
    }
    
    // 如果是文本或 HTML 文件，处理替换 pomf2.lain.la 为当前域名
    if (contentType.includes('text/html') || contentType.includes('application/json') || contentType.includes('text')) {
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

    // 对于其他类型的响应，直接传递
    return new Response(response.body, {
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
