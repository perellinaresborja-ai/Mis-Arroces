import { NextResponse } from 'next/server';

const assetLinks = [
  {
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
      namespace: 'android_app',
      package_name: 'es.misarroces.app',
      sha256_cert_fingerprints: [
        'B5:D9:1B:60:37:FB:B5:CF:97:6C:E8:1F:E5:73:39:1B:B7:7D:E7:0A:56:7C:48:FF:32:61:DD:1E:82:73:2B:FF',
        '06:2E:35:47:A9:2E:AA:E8:64:55:E1:86:45:C2:B9:EB:E0:C2:1B:6B:09:E1:56:13:7B:E2:AB:E3:85:71:BD:6B'
      ]
    }
  }
];

export async function GET() {
  return NextResponse.json(assetLinks, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}
