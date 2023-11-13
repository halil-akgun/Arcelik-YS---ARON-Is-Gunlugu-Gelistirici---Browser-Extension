# ARON İş Günlüğü Geliştirici Eklentisi Sürüm Notları


## Sürüm 1.0

### Yenilikler
- ARON İş Günlüğü Geliştirici eklentisi sürüm 1.0 yayınlandı.
- Günlük hizmet raporları için ARON tarafından oluşturulan HTML sayfasını özelleştiren temel işlevsellik eklendi.
- Hizmet kayıtlarını görüntülemek ve düzenlemek için kullanıcı dostu bir arayüz sunuyor.


## Sürüm 1.1

### Yenilikler
- Eklentinin verimliliği ve kullanıcı deneyimi üzerinde çeşitli geliştirmeler yapıldı.
- Teknisyen ve araç isimlerini eklemek ve çıkarmak için "➕" ve "➖" düğmeleri eklendi.
- Toplam tutarı hesaplayan yeni bir bölüm eklendi.
- Ücret girişlerini düzenlemek ve toplam tutarı anlık olarak güncellemek için iyileştirmeler yapıldı.


## Sürüm 1.2

### Yenilikler
- Bir sonraki güncellemede 'Malzeme' sütununun otomatik olarak doldurulmasına yönelik aşamayı ayarlayarak, başka bir sekmedeki açık bir OASİS sayfasından jetonun alınması etkinleştirildi.
- OASİS ile entegrasyon sonrasında 'Düzenle' butonunun görünürlüğü yalnızca rapor sayfasında görüntülenecek şekilde iyileştirildi.
- Birden fazla teknisyen veya araç silinirken, son silinen dışındakilerin geri gelme sorunu düzeltildi.
- Başvuru nedeni "Nakliye Montaj" ise, otomatik olarak açıklamaya "Nakliye Montaj" ifadesini ekleyen bir geliştirme yapıldı.
- Yeni bir ödeme seçeneği eklendi: "Havale".
- Sayfa yazdırılırken artık not alanı için placeholder görünmeyecek.


## Sürüm 1.3

### Yenilikler
- OASİS sitesinden malzeme stok kodları artık otomatik olarak çekilmekte ve bu stok kodları "Malzeme" sütununa otomatik olarak yerleştirilmektedir.
- Textarea alanları artık otomatik olarak büyüme özelliğine sahiptir. Satır ekledikçe textarea otomatik olarak büyüyecektir.


## Sürüm 1.4

### Yenilikler
- Günlük nakit toplamını takip etmek için yeni bir özellik eklendi: "Toplam Nakit Gelir" tablosu. Bu tablo her teknisyenin günlük nakit gelirini görüntülemenizi sağlar.


## Sürüm 1.5

### Yenilikler
- Dosya Seçme ve Güncelleme Özelliği: Kullanıcılar artık "Kaydet ve Yazdır" butonuna bastıklarında Documents klasöründen "Hesap Verileri.json" dosyasını seçebilirler. Bu dosya, günlük verilerin depolandığı bir veritabanıdır.
- Excel Raporlama ve Yazdırma: Eklenti, seçilen "Hesap Verileri.json" dosyası üzerinden tarih bazlı raporlama yapabilme yeteneği ekler. Bu özellik, kullanıcılara daha kapsamlı bir analiz imkanı sunar. Ayrıca, bu verilerin daha detaylı bir şekilde işlenebilmesi ve analiz edilebilmesi için özel bir Excel dosyası oluşturulmuştur.


## Sürüm 1.6

### Yenilikler
- Toplam Nakit Gelir tablosuna yeni bir satır eklenmiştir: "Büro". Artık bu satıra girilen değer, büro nakit geliri olarak kaydedilebilir.
- Her satıra, istenmeyen kayıtların kolayca kaldırılmasına olanak tanıyan bir silme düğmesi eklendi.
- Girilen plakalar artık otomatik olarak belirli bir formata getirilmektedir. Bu, plakaların düzenli ve tutarlı olmasını sağlar.