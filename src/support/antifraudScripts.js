export default {
    ClearSale: [
        {
            tag: `<script type="text/javascript">
                    (function (a, b, c, d, e, f, g) {
                        a['CsdpObject'] = e; a[e] = a[e] || function () {
                            (a[e].q = a[e].q || []).push(arguments)
                        }, a[e].l = 1 * new Date(); f = b.createElement(c),
                            g = b.getElementsByTagName(c)[0]; f.async = 1; f.src = d; g.parentNode.insertBefore(f, g)
                    })(window, document, 'script', '//device.clearsale.com.br/p/fp.js', 'csdp');
                    csdp('app', '#key#');
                    csdp('sessionid', '#sessionid#');
                    </script>`,
            location: "body"
        }
    ],
    SiftScience: [
        {
            tag: `<script type="text/javascript">
                var _sift = window._sift = window._sift || [];
                _sift.push(['_setAccount', '#key#']);
                _sift.push(['_setUserId', '#userid#']);
                _sift.push(['_setSessionId', '#sessionid#']);
                _sift.push(['_trackPageview']);
                
                (function () {
                function ls() {
                    var e = document.createElement('script');
                    e.src = 'https://cdn.sift.com/s.js';
                    document.body.appendChild(e);
                }
                if (window.attachEvent) {
                    window.attachEvent('onload', ls);
                } else {
                    window.addEventListener('load', ls, false);
                }
                })();
                </script>`,
            location: "body"
        }
    ],
    Konduto: [
        {
            tag: `<script type="text/javascript">
                var __kdt = __kdt || [];
                __kdt.push({ "public_key": '#key#' });
                
                (function () {
                    var kdt = document.createElement('script');
                    kdt.id = 'kdtjs'; kdt.type = 'text/javascript';
                    kdt.async = true;
                    kdt.src = 'https://i.k-analytix.com/k.js';
                    var s = document.getElementsByTagName('body')[0];
                    s.parentNode.insertBefore(kdt, s);
                })();
                </script>`,
            location: "body"
        },
        {
            tag: `<script type="text/javascript">
            (function () {
                    var period = 300;
                    var limit = 20 * 1e3;
                    var nTry = 0;
                    var intervalID = setInterval(function () {      
                        var clear = limit / period <= ++nTry;
                        if ((typeof (Konduto) !== "undefined") &&
                            (typeof (Konduto.setCustomerID) !== "undefined")) {
                            window.Konduto.setCustomerID('#customerid#');   
                            clear = true;
                        }
                        if (clear) {
                            clearInterval(intervalID);
                        }
                    }, period);
                })('#customerid#');
                </script>`,
            location: "body"
        }
    ],
    CyberSource: [
        {
            tag: `<script type="text/javascript" src="https://h.online-metrix.net/fp/tags.js?org_id=#orgid#&session_id=#key##sessionid#"></script>`,
            location: "head"
        },
        {
            tag: `<noscript>
                    <iframe style="width: 100px; height: 100px; border: 0; position:absolute; top: -5000px;"
                    src="https://h.online-metrix.net/fp/tags?org_id=#orgid#&session_id=#key##sessionid#">
                    </iframe>
                    </noscript>`,
            location: "body"
        }
    ]
}