export default {
  async fetch(request) {
    let url = new URL(request.url);
    
    // 替换当前域名为目标域名 pomf2.lain.la
    let targetUrl = new URL(request.url.replace(url.hostname, 'pomf2.lain.la'));

    // 保留原始请求的所有方法和头部
    let modifiedRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'follow'
    });

    // 发出代理请求
    let response = await fetch(modifiedRequest);

    // 获取响应类型
    let contentType = response.headers.get('Content-Type') || '';

    // 处理 HTML 文件
    if (contentType.includes('text/html')) {
      let text = await response.text();

      // 将 pomf2.lain.la 替换为当前访问的域名
      let updatedText = text.replace(/pomf2\.lain\.la/g, url.hostname);

      return new Response(updatedText, {
        headers: {
          'Content-Type': 'text/html',
          'Access-Control-Allow-Origin': '*',  // 允许跨域
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        },
        status: response.status,
        statusText: response.statusText
      });
    }

    // 处理音频/视频文件，确保流式传输
    if (contentType.includes('video') || contentType.includes('audio')) {
      // 复制原始响应的所有头部，确保 Range 请求正常
      const headers = new Headers(response.headers);
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Accept-Ranges', 'bytes');  // 支持 Range 请求

      return new Response(response.body, {
        headers: headers,
        status: response.status,
        statusText: response.statusText
      });
    }

    // 处理 CSS、JS、图片等静态资源
    if (contentType.includes('text/css') || contentType.includes('application/javascript') || contentType.includes('image')) {
      return new Response(response.body, {
        headers: {
          ...response.headers,
          'Access-Control-Allow-Origin': '*',  // 允许跨域
        },
        status: response.status,
        statusText: response.statusText
      });
    }

    // 对于其他类型的文件，直接传递
    return new Response(response.body, {
      headers: {
        ...response.headers,
        'Access-Control-Allow-Origin': '*',  // 允许跨域
      },
      status: response.status,
      statusText: response.statusText
    });
  }
}
