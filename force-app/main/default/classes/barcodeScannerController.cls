public with sharing class barcodeScannerController {
    @AuraEnabled
    public static Map<String, Object> testExec(String value) {
        Map<String, Object> res = new Map<String, Object>();
        res.put('test1', 'hoge');
        return res;
    }
    @AuraEnabled
    public static Map<String, Object> readBarcode(String value) {
        system.debug('exeExec start');
        system.debug('value = ' + value);

        String md5hash = EncodingUtil.convertToHex(
            Crypto.generateDigest('md5', Blob.valueOf(value))
        );
        system.debug('md5hash = ' + md5hash);
        system.debug('md5hash.length() = ' + md5hash.length());

        String left4 = md5hash.left(4);
        system.debug(left4);

        Integer atk = calcSum(md5hash.mid(0, 4));
        Integer def = calcSum(md5hash.mid(3, 4));
        Integer hp = calcSum(md5hash.mid(7, 4));
        Integer image = generateImageNo(md5hash.mid(11, 2), 10);
        Integer color = generateImageNo(md5hash.mid(11, 2), 8);

        system.debug('atk = ' + atk);

        Map<String, Object> res = new Map<String, Object>();
        res.put('testValue1', 'bbb');
        res.put('HP', hp);
        res.put('ATK', atk);
        res.put('DEF', def);
        res.put('IMAGE', image);
        res.put('COLOR', color);
        res.put('testValue2', 'ddd');
        return res;
    }

    private static Integer generateImageNo(String hash, Integer mod) {
        return Math.mod(calcSum(hash), mod);
    }

    private static Integer calcSum(String hash) {
        Integer sum = 0;
        for (Integer i = 0; i < hash.length(); i++) {
            String s = hash.mid(i, 1);
            switch on s {
                when 'a' {
                    sum += 10;
                }
                when 'b' {
                    sum += 11;
                }
                when 'c' {
                    sum += 12;
                }
                when 'd' {
                    sum += 13;
                }
                when 'e' {
                    sum += 14;
                }
                when 'f' {
                    sum += 15;
                }
                when else {
                    // 0～9
                    sum += Integer.valueOf(s);
                }
            }
        }
        return sum;
    }
}