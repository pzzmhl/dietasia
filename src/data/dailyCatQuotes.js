/**
 * Archivio Frasi Quotidiane del Gatto Nero di Coraline per Asia
 * Categoria 18: Massime del Giorno (365 frasi, una per ogni giorno dell'anno)
 * 
 * Regole di Sensibilità Psicologica (DCA):
 * - Nessuna moralizzazione del cibo
 * - Zero riferimenti a corpo, peso, calorie o bilance
 * - Declinato al femminile per Asia / neutro universale
 * - Universale a ogni orario (nessun vincolo mattutino)
 * - Tono felino: asciutto, enigmatico, protettivo
 */

const DAILY_CAT_QUOTES = [
  "Un pasto tranquillo è come una porta socchiusa verso il mondo reale. Lascia entrare la luce e scaccia le ombre.",
  "Il corpo conosce la strada prima ancora che la mente decida di mettersi in cammino. Basta ascoltarne il battito calmo.",
  "La nebbia densa nasconde solo ciò che ha fretta di mostrarsi. La cura di sé ha radici lente e profonde.",
  "Non fidarti mai di chi promette banchetti senza fine e senza difetti. Il nutrimento autentico abita nelle cose semplici.",
  "Mangiare con calma è l'unico modo per non farsi rubare il sapore delle ore. Un respiro lungo prima di cominciare.",
  "Le porte segrete si aprono solo quando smettiamo di forzare la toppa. La regolarità è una chiave silenziosa.",
  "Il cibo è carburante per esplorare il giardino, non un giudice che attende alla fine del viale. Ricordalo a ogni ora.",
  "Anche i topi del circo sanno che senza un pasto nutriente le acrobazie riescono male. Tratta il corpo con riguardo.",
  "La realtà ha colori sbiaditi a volte, ma è calda e sincera. Un piatto fumante sa rimettere in sesto ogni giornata.",
  "Non servono occhi di bottone per guardare lontano. Bastano occhi aperti sul piatto e sulle proprie sensazioni genuine.",
  "Il vero buonsenso consiste nel darsi il tempo necessario per un pasto posato. Tutto il resto può aspettare.",
  "Le trappole migliori sono dipinte con colori sgargianti. La vera salute invece veste abiti comodi e cammina senza rumore.",
  "Ascoltare la fame senza timore è il primo passo per non perdersi nel bosco. Il corpo sa sempre cosa chiedere.",
  "Un gatto non mangia mai con l'orologio al polso. Segue il sole, cerca l'ombra e rispetta il proprio ritmo.",
  "Una tazza fumante scalda le mani prima ancora di rischiarare la mente. Piccoli gesti che tengono saldi a terra.",
  "Non c'è magia più potente del rispetto quotidiano per i propri bisogni. Chi sa nutrirsi con garbo non teme le illusioni.",
  "Il mondo vero è imperfetto, scricchiola e ha bisogno di manutenzione. Proprio come noi: trattiamoci con infinita cura.",
  "I pasti stabili tengono lontana l'aria fredda dell'Altro Mondo. Un confine sicuro tracciato con il buon senso.",
  "Non c'è fretta nel germoglio che spunta tra i mattoni. Anche le tue energie crescono un boccone alla volta.",
  "Guardare le cose attraverso la pietra forata significa riconoscerne il valore semplice: nutrirsi è vivere, niente di più.",
  "Sedersi a tavola non chiede spiegazioni a nessuno. È solo un patto silenzioso e rinnovato con la propria vitalità.",
  "Le ombre fuggono quando una casa si riempie del profumo del pane. Abbi cura della tua giornata fin dal primo istante.",
  "Un passo alla volta nel corridoio della realtà. Chi nutre il proprio corpo con gentilezza cammina sempre a testa alta.",
  "Non esistono scorciatoie nel bosco fitto. C'è solo il cammino tranquillo di chi si ferma a mangiare al momento opportuno.",
  "Ogni momento di quiete è una tela intatta. Scegli di dipingerla con pasti sereni e pensieri liberi da ogni gabbia.",
  "Il nutrimento non è un compito da sbrigare in fretta. È la radice invisibile che tiene in piedi l'albero intero.",
  "Chi sa distinguere il fumo dal calore della legna sa anche scegliere cosa mettere nel piatto senza lasciarsi ingannare.",
  "Le finestre del palazzo rosa si aprono sulla luce grigia. È la luce vera del giorno, quella che non mente mai.",
  "Prendersi cura della fame quotidiana è un gesto antico e saggio. Nessuna illusione potrà mai competere con la semplicità.",
  "I bottoni appartengono a chi rinuncia a vedere sé stesso. Gli occhi veri sanno guardare il cibo come un alleato fidato.",
  "Non c'è bisogno di correre dietro al vento. Siediti, respira e lascia che ogni pasto faccia il suo nobile dovere.",
  "La terra bagnata dalla pioggia profuma di buono. Anche le nostre giornate rinascono quando diamo spazio a un nutrimento calmo.",
  "Un gatto nero attraversa la strada per ricordarti che sei tu a scegliere il tuo passo. Comincia con un pasto sereno.",
  "La voce del corpo è sottile come un soffio d'aria. Chi impara ad ascoltarla non si smarrisce nei labirinti della mente.",
  "Non cercare approvazioni fuori da questa finestra. La tua vitalità è un dono che si coltiva a tavola ogni giorno.",
  "Le cose fatte con cura non hanno bisogno di slogan. Un piatto sobrio consumato con pace vale più di mille parole.",
  "L'Altra Madre costruiva stanze su misura per ingannare. La vita vera invece ti lascia lo spazio per respirare e scegliere.",
  "Mangiare al momento giusto è come gettare un'ancora in un mare mosso. Mantiene saldi i piedi e limpida la rotta.",
  "Un pasto tranquillo è un saluto garbato al mondo reale. Facciamolo con calma e con il tempo necessario.",
  "Non serve essere invincibili per attraversare la giornata. Basta avere cura delle proprie forze senza sprecare energia.",
  "I topi suonano la loro fanfara per distrarre i passanti. Tu guarda dritto al tuo piatto e assapora la calma.",
  "Ogni boccone consumato con consapevolezza scioglie un filo invisibile della fretta. Sii padrone del tuo tempo a tavola.",
  "Le chiavi migliori sono quelle che aprono le porte del buonsenso. Nutrirsi con equilibrio è la serratura più facile.",
  "La realtà ha le sue sbavature e le sue ore storte. Ma ha anche una bevanda calda per accogliere i tuoi pensieri.",
  "Non trasformare il cibo in un campo di battaglia. La tavola è un luogo di pace, da custodire con affettuoso rispetto.",
  "Chi sa fermarsi quando ha fame sa anche camminare a lungo. Una buona energia è la miglior compagna di ogni avventura.",
  "Il giardino segreto fiorisce solo se viene innaffiato con pazienza. Lo stesso vale per la tua vitalità quotidiana.",
  "Niente pretese teatrali a qualsiasi ora: nutrirsi è un atto semplice che chiede solo attenzione e cura autentica.",
  "Un gatto si stira al primo raggio di luce per ricordarti che il corpo ama la grazia. Regalagli un pasto sereno.",
  "La giornata inizia quando decidi di voler bene alle tue energie. Fai un respiro lungo e ascolta cosa ti serve.",
  "Non c'è nebbia che non si sciolga davanti al calore di una zuppa fumante. Il nutrimento vero riscalda anche le ombre.",
  "La pietra con il buco mostra che le cose essenziali sono pochissime: respiro, acqua, buon cibo e mente libera.",
  "Chi mangia guardando l'orologio si perde il sapore della vita. Concediti la lentezza che chiede ogni pasto nutriente.",
  "L'Altro Mondo offriva torte giganti per nascondere aghi da cucito. Nel mondo reale preferiamo un frutto vero e saporito.",
  "Le giornate limpide nascono da piccole scelte silenziose. Un pasto regolare e tranquillo è la mossa più azzeccata.",
  "Non lasciare che le preoccupazioni si siedano a tavola prima di te. Fai spazio solo al profumo del cibo.",
  "Il corpo è una casa accogliente se smettiamo di criticarne le stanze. Nutrilo con cura e lui ti porterà lontano.",
  "I sentieri del bosco sono infiniti, ma il punto di partenza è sempre lo stesso: avere energia sufficiente per camminare.",
  "Una mela croccante sa di pioggia, sole e terra. La bellezza del cibo reale sta nella sua autentica semplicità.",
  "Non servono formule magiche per stare bene. Basta ricordarsi di nutrire il corpo quando chiama, senza rimandare.",
  "Il gatto osserva dalla staccionata: chi cammina con calma arriva sempre dove deve arrivare. Comincia dalla tavola.",
  "Le ombre si ritirano quando apriamo le persiane. Apri il cuore al nuovo giorno e nutri le tue forze con serenità.",
  "Non c'è nessun obbligo di fare grandi cose oggi. Avere cura di sé stessi con pasti regolari è già un capolavoro.",
  "I bottoni neri sono freddi e ciechi. Gli occhi veri si accendono quando scoprono il piacere di un pasto consumato in pace.",
  "La regolarità non è una prigione: è lo steccato che tiene lontani i lupi della confusione e della stanchezza.",
  "Un respiro profondo prima di sedersi a tavola. Lascia che la fame sia una guida amica e mai un nemico da combattere.",
  "Le porte che contano non hanno chiavi complicate. Apriti alla giornata con un piatto nutriente e una mente distesa.",
  "Il mondo vero è ruvido a volte, ma è l'unico posto dove si può respirare davvero. Sii grato per il tuo cibo.",
  "Chi sa ascoltare la sazietà impara a fermarsi con naturalezza. È un'arte sottile che si affina con la pazienza.",
  "Non farti incantare da promesse di facili scorciatoie. Il benessere solido si costruisce ogni giorno con passi quieti.",
  "Un gatto randagio sa che il cibo è sacro perché dona agilità e riflessi pronti. Tratta la tua tavola con riguardo.",
  "La pioggia sul tetto concilia la concentrazione. Dedica questo inizio di giornata a nutrire le tue energie con affetto.",
  "Non c'è vergogna nell'avere fame. È la vita che bussa alla porta e chiede di essere alimentata con dignità.",
  "Le cose che durano nel tempo sono quelle fatte senza strappi. Mangia al tuo ritmo e lascia andare la fretta.",
  "La luce filtra tranquilla sulla stanza. Mettiti a tuo agio e dai al tuo corpo ciò di cui ha bisogno.",
  "Il cibo consumato in silenzio e tranquillità ha una forza invisibile: rimette in ordine i pensieri più arruffati.",
  "L'Altra Madre pretendeva che tutto fosse impeccabile per non mostrare il vuoto. Noi amiamo la pienezza delle cose vere.",
  "Chi nutre il proprio corpo con rispetto semina serenità in ogni ora della giornata. Inizia con una scelta limpida.",
  "Le grandi avventure cominciano sempre con un buon pasto. Anche Coraline ha dovuto fare il pieno di energia.",
  "Non farti rubare la calma dal rumore del mondo. La tua tavola è un'isola protetta dove regna solo il buon senso.",
  "Un gatto non ha bisogno di specchi per sapere chi è. Allo stesso modo, il tuo valore non dipende da nessun contatore.",
  "La fame è un segnale di vita autentica, non una colpa. Rispondi con piatti nutrienti e un sorriso sincero.",
  "I vecchi teatri polverosi nascondono storie bizzarre, ma la vita vera accade davanti a una tazza fumante.",
  "Chi sa prendersi cura del proprio piatto impara a difendersi da tutte le trappole dell'inganno. La chiarezza parte da qui.",
  "Non c'è alcuna fretta nel cammino quotidiano. Lascia che il tempo scorra senza ansie e accompagnalo con un pasto sereno.",
  "La pietra forata insegna a guardare oltre le apparenze. Il cibo è nutrimento e forza vitale, niente di più e niente di meno.",
  "I pasti stabili sono i pilastri invisibili di una mente riposata. Proteggili con la solita flemma felina.",
  "Non farti incantare da chi pretende sacrifici inutili. Il corpo ha bisogno di carburante, non di privazioni assurde.",
  "Una macedonia fresca o un piatto caldo: la salute ama la varietà e rifugge ogni noiosa rigidità.",
  "Il gatto socchiude gli occhi davanti alla ciotola del latte: il piacere delle cose buone è un diritto naturale.",
  "Le giornate migliori sono quelle in cui ci trattiamo con infinita gentilezza. Comincia subito, dalla prima forchettata.",
  "Non guardare indietro cercando errori. Guarda il piatto di oggi e assapora la possibilità di fare scelte serene.",
  "La realtà è un tessuto solido che non si strappa per un soffio di vento. Cammina sicuro e nutri le tue forze.",
  "Chi mangia con gratitudine non ha paura delle ombre. La luce interiore si alimenta con la cura quotidiana.",
  "I fili invisibili dell'ansia si spezzano davanti a un pasto consumato con calma. Regalati questo momento di pace.",
  "Un gatto randagio sa che l'indipendenza nasce dal sapersi curare da soli. Tratta il tuo corpo come il tuo miglior amico.",
  "La nebbia fuori fa sembrare tutto lontano. Ma la tua tazza calda è qui, vicina e rassicurante come deve essere.",
  "Non servono grandi imprese per essere fieri di sé. Mangiare con equilibrio e ascolto è già un traguardo prezioso.",
  "La porta tra le due realtà è sigillata se impari ad amare il mondo vero. Nutriti di cose autentiche e buone.",
  "Saluta la tua vitalità. Accoglila con un respiro profondo e con un pasto che sappia darti forza e serenità.",
  "Chi sa fermarsi al momento giusto ha capito il segreto dei gatti: il riposo e il cibo sono i cardini del mondo.",
  "L'Altro Mondo offriva illusioni dolciastre per mascherare trappole fredde. La realtà invece è trasparente e generosa.",
  "Non lasciare che le abitudini diventino una gabbia. Mangia con regolarità, ma lasciati sempre lo spazio per sorridere.",
  "Un buon pasto è un ponte verso la lucidità. Attraversalo con passo fermo e mente libera da ogni ansia.",
  "Un piatto semplice consumato con il cuore leggero vale più di qualsiasi banchetto sontuoso e artefatto.",
  "I topi ballerini possono fare tutte le acrobazie che vogliono, ma alla fine cercano solo una briciola di cibo autentico.",
  "Il corpo è un alleato fedele che non mente mai. Se ti chiede nutrimento, daglielo senza esitazione né timori.",
  "Non farti prendere dalla fretta delle ore dense. Quei minuti dedicati a mangiare con calma ti ripagheranno per tutta la giornata.",
  "La pietra forata mostra che dietro ogni paura c'è solo un'illusione. Il cibo è un amico che ti tiene in vita.",
  "Chi rispetta la propria fame impara a rispettare anche i propri limiti e la propria bellezza. Tutto è collegato.",
  "Un gatto osserva le foglie cadere: ogni cosa ha la sua stagione, e ogni stomaco ha i suoi orari naturali.",
  "La salute non è un traguardo da raggiungere col fiato corto. È il sentiero tranquillo su cui cammini ogni giorno.",
  "Nessuna pretesa di infallibilità oggi. C'è solo una persona che sceglie di prendersi cura di sé con discrezione.",
  "I bottoni cuciti tolgono la vista. Gli occhi aperti sul cibo riconoscono il valore delle cose genuine e buone.",
  "Il calore di un pasto consumato in pace è la miglior difesa contro ogni vento contrario. Riposati dentro questo momento.",
  "Non farti sedurre dalle promesse di chi vende chimere irreali. Il mondo vero è imperfetto e meravigliosamente accogliente.",
  "La costanza gentile vince sempre sulla violenza delle privazioni. Nutriti con giudizio e lascia che la vita faccia il resto.",
  "Un gatto nero sul davanzale porta serenità a chi sa guardarlo. Guarda la tua giornata con gli stessi occhi pazienti.",
  "I pasti regolari sono come i rintocchi di una campana lontana: danno ritmo alle ore senza disturbare il silenzio.",
  "Chi sa volersi bene a tavola sa difendersi da tutte le trappole del mondo. La vera indipendenza comincia qui.",
  "Un soffio d'aria fresca schiarisce i pensieri. Metti da parte i dubbi e fai spazio a un pasto nutriente.",
  "Non c'è niente di più rivoluzionario che trattare il proprio corpo con infinita dolcezza in un mondo che va di fretta.",
  "Le porte segrete possono restare chiuse: noi preferiamo il calore della cucina e il profumo delle cose buone.",
  "Ascolta il respiro prima di ogni boccone. Mangiare con calma è un atto di rispetto verso la propria persona.",
  "La giornata ti aspetta a braccia aperte. Dalle il benvenuto nutrendo le tue energie con affettuosa lucidità.",
  "Non fidarti mai di chi ti suggerisce di ignorare i segnali del tuo corpo. Il corpo è l'unica casa che abiterai per sempre.",
  "L'Altra Madre cucinava piatti spettacolari che svanivano nel nulla. Il cibo reale invece rimane e dona vera forza.",
  "Un pasto sereno consumato con calma è come un mantello impermeabile: ti protegge da qualsiasi acquazzone della giornata.",
  "I gatti non fanno mai compromessi sulla loro comodità. Non fare compromessi sulla cura del tuo nutrimento quotidiano.",
  "Chi sa mangiare con consapevolezza impara a vedere le trappole prima ancora di avvicinarsi. La lucidità nasce a tavola.",
  "Non caricare il piatto di aspettative esagerate. Il cibo è carburante per vivere, non un banco degli imputati.",
  "La luce filtra tra le persiane. È il momento di sostenere il corpo con qualcosa di buono e genuino.",
  "I topi del circo sanno che ogni salto richiede energia costante. Non saltare i pasti se vuoi camminare con agilità.",
  "La quiete mattutina è un tesoro fragile. Custodiscila mangiando senza guardare schermi e senza farti distrarre.",
  "Non c'è magia più grande del sapersi ascoltare con sincerità. Se hai fame, mangia; se sei sazia, fermati in pace.",
  "Un gatto randagio attraversa la nebbia senza paura perché sa dove trovare riparo. Trova il tuo riparo nelle buone abitudini.",
  "Le cose semplici sono quelle che ci salvano sempre. Un bicchier d'acqua, un piatto nutriente, un respiro profondo.",
  "L'Altro Mondo era una gabbia dorata senza uscita. Il mondo vero ha porte aperte e sentieri che puoi scegliere liberamente.",
  "Mangiare a orari regolari aiuta il cuore a battere senza ansia. Fai di questa abitudine la tua ancora sicura.",
  "Non permettere a nessuno di giudicare i tuoi bisogni. Il nutrimento è un diritto fondamentale della vita, non una concessione.",
  "La pietra forata mostra la realtà nuda: siamo esseri viventi che hanno bisogno di cure quotidiane, senza troppe scene.",
  "Un tocco leggero per aprire la giornata. Guarda avanti con la serenità di chi sa come prendersi cura di sé.",
  "I fili del burattinaio si spezzano quando impariamo a scegliere con la nostra testa. Comincia dalle scelte alimentari.",
  "La bellezza di un pasto consumato in pace risiede nella sua totale assenza di drammi. Vivi con sobria naturalezza.",
  "Chi sa nutrirsi con garbo non teme le giornate grigie: ha dentro di sé tutta l'energia necessaria per illuminarle.",
  "Un gatto si acciambella al sole e dimentica il freddo della notte. Fai lo stesso: accogli il nuovo giorno con fiducia.",
  "Non farti prendere dalla fretta di arrivare chissà dove. Il momento presente è l'unico pasto che puoi gustare davvero.",
  "Le buone scelte a tavola sono come passi morbidi nella neve: lasciano un segno chiaro senza fare alcun rumore.",
  "La salute è un'alleanza fedele tra mente e stomaco. Tratta entrambi con il massimo riguardo durante l'intera giornata.",
  "Apri gli occhi sul mondo vero, con tutta la sua imperfetta bellezza. Nutri le tue forze e cammina serena.",
  "Chi sa prendersi cura del proprio piatto impara a navigare a vista anche nelle tempeste più dense. La calma parte da dentro.",
  "L'Altra Madre offriva specchi che riflettevano solo ciò che lei voleva. I tuoi occhi invece sanno riconoscere il buon nutrimento.",
  "Un pasto tranquillo è la miglior risposta alle provocazioni della giornata. Mettiti al riparo con una buona abitudine.",
  "I gatti amano le routine tranquille: sonnellino, stiracchiata, cibo nutriente. Una formula antica che funziona sempre.",
  "Non c'è motivo di complicare ciò che la natura ha fatto semplice. Mangia ciò che ti dà energia e fallo con pace.",
  "La voce dello stomaco chiede rispetto, non giudizi. Accoglila come faresti con un caro amico che bussa alla porta.",
  "Le ombre si allungano solo quando il sole è basso. Alza la testa verso la luce del giorno e nutri la tua vitalità.",
  "Non esistono cibi miracolosi né cibi proibiti. Esiste solo il buon senso di chi sa nutrire le proprie giornate con equilibrio.",
  "La pietra forata aiuta a guardare il mondo senza illusioni: avere fame è naturale, mangiare con cura è saggezza.",
  "Chi sa ascoltarsi a tavola impara a difendere i propri confini anche nella vita. Il rispetto per sé comincia qui.",
  "Un gatto siede composto davanti alla finestra: fuori piove, ma dentro c'è calore e buon cibo. Cosa chiedere di più?",
  "Le scorciatoie facili nascondono sempre un prezzo troppo alto. Noi preferiamo la strada maestra, fatta di pasti regolari.",
  "Non farti rubare il momento del pasto dalla fretta degli altri. Il tuo ritmo appartiene solo a te: difendilo con fermezza.",
  "La serenità quotidiana è come una tazza calda tra le mani: scalda l'animo e allontana ogni brivido di insicurezza.",
  "I topi del circo sanno che la concentrazione si nutre di buone abitudini. Fai il pieno di forza prima di metterti in cammino.",
  "L'Altro Mondo vendeva solo fumo e cartapesta. La bellezza del tuo piatto reale sta nella sua concretezza nutriente.",
  "Non trasformare le abitudini in catene. La vera regolarità è una musica dolce che accompagna la giornata senza forzature.",
  "Chi mangia con gratitudine non si sente mai svuotato. Trova il tempo per assaporare ciò che hai davanti agli occhi.",
  "Un gatto randagio sa che la dignità non si compra. Si manifesta in ogni gesto, compreso il modo in cui ci nutriamo.",
  "Il silenzio della stanza invita a fare spazio a cose buone. Lascia fuori dalla porta ogni pensiero pesante e siediti a tavola.",
  "Non c'è fretta di catalogare ogni cosa. Vivi il tuo pasto presente e lascia che le ore successive facciano il loro corso.",
  "Le porte segrete non servono a chi sta bene a casa propria. Costruisci il tuo benessere giorno dopo giorno, piatto dopo piatto.",
  "La serenità è un patto silenzioso rinnovato a ogni pasto. Mantienilo con garbo, senza imposizioni e senza rimproveri.",
  "I sentieri del giardino reale sono aperti per te. Nutri le tue gambe e il tuo cuore con la solita saggia misura.",
  "Un passo verso il mondo reale. Ricordati che la cura per te stessa è l'unica bussola che non sbaglia mai rotta.",
  "Non c'è niente di più saggio che concedersi un pasto tranquillo prima che il rumore del mondo prenda il sopravvento.",
  "L'Altra Madre voleva che Coraline perdesse i suoi occhi per non vedere la verità. Tu tieni gli occhi ben aperti sulla tua salute.",
  "Chi sa rispettare i propri pasti impara a non farsi calpestare dalle urgenze altrui. La salute è la tua prima priorità.",
  "I gatti non chiedono il permesso per stiracchiarsi al sole. Non chiedere il permesso per prenderti cura del tuo corpo.",
  "Mangiare con calma non è una perdita di tempo: è la scelta più intelligente per attraversare le ore con lucidità.",
  "Non farti prendere dalla fretta di saltare una sosta. Chi cammina a stomaco vuoto finisce per inciampare nella nebbia.",
  "La pietra forata svela la semplicità delle cose: un corpo nutrito con amore è una fortezza inespugnabile per i brutti sogni.",
  "I topi ballerini suonano per chi ha voglia di ascoltare, ma la saggezza abita nel silenzio di una tavola ben rispettata.",
  "Un piatto semplice, qualche minuto di quiete, un respiro profondo. Ecco come si costruisce una giornata davvero solida.",
  "Non farti sedurre dalle chimere dell'impeccabilità. Il mondo reale è imperfetto e meraviglioso proprio perché è vivo.",
  "Il gatto ti guarda sornione: vedo che sai dove mettere i piedi oggi. Concediti un buon pasto e vai avanti.",
  "Le abitudini buone sono come vecchi amici fidati: non fanno domande indiscrete e ti accolgono sempre con calore.",
  "Chi sa ascoltare la propria fame senza sensi di colpa ha già vinto la battaglia contro tutte le finzioni del mondo.",
  "La luce del giorno illumina la tavola. Fai spazio alle cose genuine e lascia che i pensieri neri svaniscano nel nulla.",
  "Non c'è bisogno di dimostrare niente a nessuno. Mangia per darti energia, per sentirti vivo e per stare in pace.",
  "L'Altro Mondo offriva solo regali avvelenati. La realtà invece ti offre la libertà di scegliere ciò che ti fa stare bene.",
  "Un pasto regolare e tranquillo è il raggio di luce che dissipa la nebbia interiore. Abbine cura ogni giorno.",
  "I fili invisibili dell'ansia si sciolgono quando impariamo a masticare con calma. Sii presente a ogni singolo boccone.",
  "La salute non è una rincorsa affannosa: è la capacità di fermarsi quando serve e di darsi il giusto carburante.",
  "Un gatto randagio sa che ogni alba porta con sé nuove opportunità. Accoglile con la mente riposata e il corpo nutrito.",
  "Non lasciare che la fretta ti rubi il sapore delle ore. Chi mangia con garbo cammina con passo sicuro verso la sera.",
  "Le porte del mondo vero restano sempre aperte per chi sa apprezzare la calma. Comincia da questo piccolo momento intimo.",
  "Non c'è magia più bella del buonsenso applicato alla vita quotidiana. Scegli piatti nutrienti e trattati con discreto rispetto.",
  "I rintocchi dell'orologio scandiscono il tempo, ma sei tu a decidere come abitarlo. Nutriti con serenità e vivi appieno.",
  "Buona giornata di vita autentica. Che la cura per il tuo benessere sia il faro luminoso che ti guida in ogni momento.",
  "Nutrire il corpo con calma è un modo per dire al mondo che non abbiamo fretta di farci spaventare dalle ombre.",
  "L'Altra Madre prometteva meraviglie senza difetti. La realtà è più modesta, ma ha il sapore vero del pane fresco.",
  "Un pasto sereno è un vero atto di autonomia quotidiana. Non rinunciarvi mai per inseguire la fretta del mondo.",
  "I gatti conoscono il segreto dell'equilibrio: nessun movimento superfluo, cibo nutriente e nessun dramma per il domani.",
  "Non cercare scorciatoie magiche. La cura personale abita nei gesti ripetuti con pazienza e senza clamore.",
  "Guardare attraverso la pietra forata serve a togliere le illusioni: nutrirsi è un fatto naturale, privo di ombre e colpe.",
  "I topi del circo fanno rumore per attirare l'attenzione. Tu rimani concentrata sul tuo benessere e goditi il tuo piatto con animo disteso.",
  "Un piatto nutriente consumato con animo leggero ha il potere di rischiarare anche la giornata più piovosa e cupa.",
  "Non farti intrappolare dalle aspettative degli altri. A tavola ci sei tu, e conta solo il tuo ritmo autentico.",
  "La regolarità a tavola è un patto silenzioso con la propria vitalità: difendila con nobile fermezza felina.",
  "Un gatto nero sul muretto osserva e non giudica. Fai lo stesso con le tue giornate: accoglile e basta.",
  "Le buone abitudini non sono gabbie dorate: sono sentieri battuti che rendono più facile il ritorno a casa.",
  "Ascoltare i segnali dello stomaco è il modo più antico per non farsi incantare dalle illusioni del teatro.",
  "Nessun trofeo da vincere e nessun tribunale da temere: il cibo è nutrimento fedele, nient'altro.",
  "Un respiro profondo schiarisce i vetri della mente. Fai entrare l'aria fresca e goditi il sapore semplice del tuo pasto.",
  "L'Altro Mondo offriva solo promesse col trucco. Qui invece ci sono pasti caldi e tempo per respirare davvero.",
  "Un pasto regolare è la miglior bussola per non perdere l'orientamento nelle ore più affollate della giornata.",
  "Mangiare con calma è una piccola rivoluzione silenziosa in un mondo che pretende di correre sempre.",
  "Non permettere alla fretta di rubarti il momento del cibo: quel quarto d'ora ti appartiene di diritto.",
  "I sentieri del giardino diventano facili da percorrere quando le energie sono stabili e ben alimentate.",
  "Camminare tra i mondi richiede zampe salde. Chi mangia a sufficienza non perde mai l'equilibrio.",
  "Non c'è nessun patto con il destino da rispettare oggi. C'è solo il patto con te stessa di trattarti con riguardo.",
  "Le cose che contano non fanno rumore. Un buon pasto consumato in pace vale più di cento proclami.",
  "Sedersi a tavola è un contatto sincero con il mondo vero. Ricordati che sei tu a decidere con quale passo attraversare le ore.",
  "Fai spazio alla tua quiete interiore. La tavola è un rifugio sicuro, non un tribunale.",
  "Prendersi cura della fame quotidiana è un atto di rispetto antico che non passa mai di moda.",
  "L'Altra Madre voleva cucire bottoni per non farci guardare la realtà. Noi teniamo gli occhi aperti sul nostro piatto.",
  "Un buon pasto consumato con posato rispetto è la miglior fondazione per una giornata solida e vivibile.",
  "I gatti non si scusano mai per essere sé stessi. Non scusarti mai per aver bisogno di nutrimento, riposo e cura.",
  "Non farti rubare la calma dal ronzio delle scadenze. Fermarsi a mangiare è un diritto fondamentale.",
  "La pietra forata insegna a vedere le cose essenziali: una tavola ordinata, un pasto nutriente e pensieri sgombri.",
  "I topi saltatori possono fare mille piroette, ma hanno sempre bisogno di fermarsi. Non pretendere troppo da te.",
  "Un piatto nutriente consumato in pace è come un raggio di sole che buca la nebbia delle preoccupazioni. Fanne tesoro oggi.",
  "Non permettere che le voci del corridoio giudichino le tue scelte. Sei tu a custodire il tuo equilibrio.",
  "Il ritmo dei pasti è una forma di rispetto costante che facciamo al nostro organismo. Abbine cura.",
  "Un gatto randagio sa dove ripararsi quando piove. La tua cucina è il tuo riparo contro il vento freddo.",
  "Le abitudini quotidiane sono fili robusti: tessono una tela che ti sostiene quando le ore si fanno dense.",
  "Dare ascolto alla fame vera significa fare pace con la propria natura. È il segreto più semplice di tutti.",
  "Non c'è niente di più saggio che procedere sapendo di potersi prendere cura di sé con calma e garbo felino.",
  "La realtà vera veste cose semplici. Scegli cibi genuini e lascia che la tua energia cresca piano piano.",
  "L'Altro Mondo offriva banchetti finti per comprare la libertà. Il mondo vero offre pasti sobri e vera indipendenza.",
  "Un pasto posato a inizio giornata o nel pomeriggio rimette in sesto i pensieri scompigliati dal vento.",
  "Chi impara a mangiare senza l'ansia del giudizio ritrova il piacere autentico di abitare il presente.",
  "Non lasciare che le scadenze decidano per il tuo stomaco. Sei tu a stabilire quando è ora di fermarsi.",
  "I sentieri del Pink Palace sono pieni di foglie secche. Spazzale via e fai spazio a una tavola serena.",
  "Un gatto si stira pigro sul pavimento di legno: la vita ha i suoi tempi, e tu hai il diritto di seguire i tuoi.",
  "Nessuna prova da superare a tavola: solo il piacere discreto di dare al corpo ciò che chiede.",
  "Le cose essenziali non chiedono sacrifici assurdi: chiedono soltanto regolarità, pazienza e un po' di silenzio.",
  "Nutrirsi con riguardo è la promessa che facciamo alla nostra vitalità per le ore a venire. Mantienila con sobria fierezza.",
  "Apri la porta alla tranquillità. Chi si siede a mangiare con garbo non teme le trappole dell'Altra Madre.",
  "Fermarsi a tavola quando la giornata incalza è il gesto più coraggioso che tu possa compiere.",
  "L'Altra Madre cercava di convincere con illusioni zuccherate. La realtà è fatta di cibi semplici che nutrono senza inganni.",
  "Un pasto tranquillo è un solido confine protettivo che tracci contro le intrusioni dell'ansia quotidiana.",
  "I gatti sanno che non serve affannarsi: basta fare ogni cosa al momento opportuno, soprattutto mangiare.",
  "Non farti sedurre dalle chimere impeccabili dell'Altro Mondo. Quella è una ragnatela; il nutrimento autentico è vita vera.",
  "La pietra forata mostra sempre ciò che c'è dietro l'apparenza: dentro questo piatto c'è solo carburante per camminare.",
  "I topi del circo corrono in tondo senza meta. Tu fermati, siediti e assapora il tuo pasto con tutta la calma necessaria.",
  "Un piatto nutriente consumato con il cuore sgombro è la miglior prevenzione contro ogni forma di stanchezza mentale.",
  "Non permettere che i doveri oscurino il piacere di nutrirti bene. Sii generosa con le tue energie.",
  "La regolarità a tavola è un confine sicuro che tiene lontani i brutti sogni e le vecchie insicurezze.",
  "Un gatto nero ti fissa con le orecchie dritte: non c'è bisogno di spiegazioni, siediti e mangia con calma.",
  "Le abitudini buone sono chiavi che aprono stanze tranquille dove nessuno può venire a disturbarti.",
  "Dare ascolto ai propri bisogni reali è l'unica vera forma di saggezza che non tradisce mai.",
  "Non c'è niente da temere in questa giornata. Hai tutte le risorse per viverla bene, a cominciare da un pasto consumato con cura.",
  "La luce del buonsenso rischiara anche i vicoli più bui. Fai spazio alla serenità nelle tue scelte quotidiane.",
  "L'Altro Mondo vendeva solo apparenze lucide. Il mondo vero ha sapori caldi, concreti e rassicuranti.",
  "Un pasto regolare è la miglior dichiarazione di indipendenza verso il caos del mondo esterno.",
  "Prendersi il tempo di gustare ogni boccone è come accendere una lanterna nella notte.",
  "Non farti travolgere dalle pretese del momento: proteggi il tuo piatto e difendi il tuo benessere.",
  "I sentieri della Pink Palace House portano sempre al portone di casa. La cucina è dove ci si ritrova.",
  "Chi sa muoversi nell'ombra sa anche riconoscere il calore della stufa. Trattati con la dovuta attenzione.",
  "Non c'è motivo di agitarsi oggi. Il mondo aspetta con pazienza che tu abbia finito di nutrirti con calma.",
  "Le cose che hanno valore crescono a ritmo naturale. Anche le tue energie crescono un pasto alla volta.",
  "Sedersi a tavola è un patto di alleanza con il tuo corpo per oggi. Onoralo con rispetto, buonsenso e serenità.",
  "Un saluto discreto dal davanzale: la tavola è pronta, lascia fuori i brutti pensieri e comincia.",
  "Dare alle proprie forze il giusto sostegno quotidiano significa camminare nel mondo a schiena dritta.",
  "L'Altra Madre voleva che Coraline restasse bambola. Tu sei viva, respira e nutri la tua libertà.",
  "Un pasto consumato senza fretta è come una corazza invisibile contro tutte le provocazioni della giornata.",
  "I gatti amano le abitudini ordinate perché tolgono la nebbia. Fai lo stesso con i tuoi pasti.",
  "Non farti ingannare dalle promesse esagerate: un piatto caldo e genuino vince contro ogni artificio.",
  "La pietra forata svela la verità semplice delle cose: il cibo serve a farti vivere, non a metterti sotto esame.",
  "I topi saltano sulla corda tesa, ma tu puoi camminare con entrambi i piedi per terra. Mangia con calma.",
  "Un piatto nutriente consumato con animo disteso ha il potere di rischiarare anche le giornate più dense di impegni.",
  "Non lasciare che i rimpianti siedano al tuo tavolo. A tavola c'è posto solo per la cura del presente.",
  "La costanza nei pasti è un filo di lana robusto che cuce insieme le ore senza strappi.",
  "Un gatto si acciambella vicino alla stufa: cercati un posto comodo e goditi il nutrimento che ti spetta.",
  "Le buone abitudini sono amici silenziosi che ti coprono le spalle quando la nebbia si alza.",
  "Rispettare i ritmi naturali è il modo più efficace per non perdersi nei corridoi bui della mente.",
  "Non c'è niente che un pasto nutriente e un respiro profondo non possano rimettere nella giusta prospettiva.",
  "La luce entra dalla finestra e scalda la stanza. Siediti, respira e lascia che il cibo faccia il suo dovere.",
  "L'Altro Mondo offriva solo gabbie ornate a festa. La libertà vera sta nella semplicità dei tuoi gesti quotidiani.",
  "Un pasto sereno è come un punto fermo tracciato nel corso della giornata: dona chiarezza a tutto.",
  "Mangiare con calma è l'arte felina di non lasciarsi rubare il tempo dalle urgenze altrui.",
  "Non permettere alla fretta di rubarti il contatto con la realtà: il cibo ti àncora saldamente a terra.",
  "I sentieri del bosco sono pieni di bivi, ma la strada di casa profuma sempre di cibo buono.",
  "Un gatto randagio sa che per saltare in alto servono muscoli nutriti e mente sgombra.",
  "Non c'è nessuna gara in corso oggi. C'è solo una persona che sceglie di trattarsi con discreta cura e rispetto.",
  "Le cose semplici sono ponti indistruttibili: un piatto caldo, un sorso d'acqua, un respiro posato.",
  "Un buon pasto è un ponte solido verso le ore che ti attendono. Attraversalo con passo sciolto e cuore leggero.",
  "Cammina a passo felpato tra i mondi. Che la tua tavola di oggi sia un luogo di nutrimento e sobria serenità.",
  "Trattare il proprio corpo con garbo quotidiano è l'unico modo per non farsi incantare dagli specchi bugiardi.",
  "L'Altra Madre voleva intrappolare le anime con feste finte. Tu proteggi la tua anima con pasti veri e sereni.",
  "Un pasto tranquillo è il miglior regalo che puoi farti prima di rimetterti in cammino.",
  "I gatti non sprecano energia in battaglie inutili. Fai come noi: mangia quando serve e riposati con cura.",
  "Non cercare approvazioni effimere. La vera forza si costruisce a tavola, giorno dopo giorno, senza proclami.",
  "La pietra forata insegna a distinguere il vero dal falso: un piatto cucinato con cura è sempre verità pura.",
  "I topi del circo ballano a comando. Tu muoviti solo al ritmo del tuo stomaco e dei tuoi bisogni.",
  "Un piatto nutriente consumato con pace nel cuore scioglie ogni residuo di nebbia e dona limpidezza.",
  "Non permettere che le ansie occupino la sedia accanto a te: lasciale fuori dalla porta della cucina.",
  "La regolarità a tavola è un argine solido contro le alluvioni dell'umore e della fretta.",
  "Un gatto socchiude gli occhi al sole tiepido: c'è tanta bellezza nella realtà, a cominciare dal cibo che nutre davvero.",
  "Le abitudini quotidiane sono radici buone: più vanno a fondo, meno il vento potrà scuoterti.",
  "Ascoltare la fame senza paura è la chiave che apre tutte le porte della serenità.",
  "Non c'è motivo di correre a testa bassa. Il tempo si piega alla volontà di chi sa dedicarsi alle cose essenziali con pace.",
  "La luce vera rischiara il giardino rosa. Nutri il tuo corpo con un pasto che sappia di buono e di sincero.",
  "L'Altro Mondo vendeva solo sogni a caro prezzo. La vita vera chiede solo di essere vissuta con garbo.",
  "Un pasto regolare è la miglior bussola per orientarsi tra i mille impegni delle ore a venire.",
  "Mangiare con compostezza e senza fretta è un segno di grande dignità personale.",
  "Non farti rubare la calma dal ticchettio delle lancette: i pasti si gustano, non si timbrano come cartellini.",
  "I sentieri della vita sono lunghi, ma si affrontano facilmente se non si dimentica mai di fare rifornimento.",
  "Un gatto randagio sa che la dignità non ha bisogno di ornamenti: basta un posto tranquillo e cibo genuino.",
  "Nessun obbligo di infallibilità grava su questa giornata. C'è solo l'impegno sereno di prenderti cura di te.",
  "Le cose più preziose non hanno bisogno di etichette. Un piatto caldo e curato è la miglior dimostrazione di rispetto.",
  "Sedersi a tavola è una pausa rigenerante dentro la giornata. Accoglila con calma e lascia che ricarichi le tue forze.",
  "I gatti sanno dove filtra il sole: basta seguirci. La tua tavola di oggi è un'oasi protetta dove ritrovare la calma.",
  "Nutrire le proprie forze con regolarità è il modo migliore per non temere le ombre del bosco.",
  "L'Altra Madre offriva pietanze meravigliose che lasciavano un vuoto dentro. Il cibo del mondo vero riempie di vita autentica.",
  "Un pasto tranquillo è il miglior investimento per non perdere la calma durante le ore più frenetiche.",
  "I gatti sanno che la vera intelligenza consiste nel non complicarsi l'esistenza: un pasto sereno, un passo morbido.",
  "Non farti prendere dalla fretta cieca: siediti, respira e lascia che il cibo ti restituisca la tua lucidità.",
  "La pietra forata mostra le cose senza abbellimenti: il cibo è tuo amico, fidati della sua semplicità.",
  "I topi ballerini suonano per attirare chi si sente distratto. Tu resta ancorata al piacere semplice del cibo genuino.",
  "Un piatto equilibrato e consumato con animo leggero rimette a posto anche la giornata più contorta.",
  "Non lasciare che i giudizi altrui si intrufolino tra una forchettata e l'altra: il piatto è solo tuo.",
  "La regolarità a tavola è una bussola silenziosa che ti indica la rotta quando fuori c'è tempesta.",
  "Un gatto ti osserva dal muretto: vedo che sai trattarti con riguardo oggi. Molto bene, vai avanti così.",
  "Le buone abitudini sono mattoni robusti con cui costruisci la tua fortezza contro il caos.",
  "Dare ascolto al corpo quando chiama è un segno di profonda maturità e intelligenza felina.",
  "Non c'è fretta nel bosco quando si sa dove andare. Siediti, gusta il tuo pasto e poi riprendi la marcia con calma.",
  "La luce del giorno rischiara le stanze della casa. Riempi la tua tavola di colori autentici e di profumi rassicuranti.",
  "L'Altro Mondo offriva solo gabbie dorate. La tavola del mondo vero è un porto aperto e sicuro.",
  "Un pasto sereno è come un punto fermo tracciato nel diario: dona ordine, stabilità e grande lucidità.",
  "Chi mangia con serenità non si perde nei rimpianti. Fai di ogni pasto un momento accogliente per il tuo palato.",
  "Non permettere a nessuno di farti dubitare del valore della tua cura quotidiana: cammina a testa alta.",
  "I sentieri della realtà sono pietrosi a volte, ma sono gli unici che portano verso posti che esistono davvero.",
  "Un gatto randagio sa che il conforto migliore abita nei gesti semplici e ripetuti senza ansia.",
  "Non c'è nessuna prova da superare oggi. C'è solo una persona che sceglie di volersi bene con i fatti.",
  "Le cose buone chiedono solo di essere accolte con cuore leggero. Fai spazio a un buon pasto nutriente.",
  "La cura di sé è la promessa rinnovata di trattarsi con riguardo per tutte le ore a venire. Sii fedele alla tua pace.",
  "Saluta la tua forza interiore: si alimenta a ogni boccone consumato con pace e rispetto.",
  "Fermarsi a mangiare è un gesto di indipendenza che nessuno potrà mai toglierti. Custodiscilo con orgoglio.",
  "L'Altra Madre voleva rubare gli occhi a Coraline. Tu usa il tuo sguardo vero per cogliere la bellezza del presente.",
  "Un pasto consumato con paziente rispetto è il miglior scudo contro ogni forma di frenesia o dubbio passeggero.",
  "I gatti non chiedono permessi per sedersi al calduccio. Non chiedere permessi per nutrirti con dignità e calma.",
  "Non cercare scorciatoie che promettono troppo: il vero benessere cammina a passo lento e costante.",
  "La pietra forata insegna che la realtà non ha bisogno di filtri: un buon piatto parla da solo.",
  "I topi del circo saltano per farsi applaudire. Tu nutri il tuo corpo per te stessa, non per fare spettacolo.",
  "Un piatto nutriente consumato con pace nel cuore scioglie ogni residuo di nebbia e dona una limpidezza impagabile alle ore.",
  "Non lasciare che il rumore del mondo esterno soffochi la voce dei tuoi bisogni. Nutriti con giudizio e cammina a testa alta.",
  "La regolarità a tavola è un patto fedele con la tua vitalità: proteggila con la solita nobile fermezza felina.",
  "Un gatto nero si stira al sole tiepido e approva con un battito lento di palpebre: la vita vera ti aspetta.",
  "Le buone abitudini sono radici profonde che ti tengono salda mentre il vento scuote i rami con forza.",
  "Chi sa trattarsi con riguardo a tavola ha capito tutto ciò che serve per vivere bene nel mondo reale.",
  "Cammina a testa alta nel tuo percorso di cura e di ascolto: il buonsenso vissuto con serenità è la vera magia.",
  "Fai un respiro lungo e posa i pensieri. Il gatto socchiude le pupille gialle, approva e si riaddormenta al sicuro."
];

/**
 * Restituisce il saluto appropriato in base all'orario odierno
 * @param {Date} [now]
 * @returns {string} Saluto personalizzato
 */
export function getTimeOfDayGreeting(now = new Date()) {
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeVal = hours + minutes / 60;

  // Dalle 05:00 alle 12:59 -> Buongiorno
  if (timeVal >= 5 && timeVal < 13) {
    return 'Buongiorno Asia';
  }
  // Dalle 13:00 alle 18:29 -> Buon pomeriggio
  if (timeVal >= 13 && timeVal < 18.5) {
    return 'Buon pomeriggio Asia';
  }
  // Dalle 18:30 alle 04:59 -> Buonasera
  return 'Buonasera Asia';
}

// Generatore deterministico pseudo-casuale (Mulberry32)
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Permutazione deterministica senza ripetizioni dei 365 giorni
function generateDailyPermutation(seed = 1337) {
  const perm = Array.from({ length: 365 }, (_, i) => i);
  const rng = mulberry32(seed);
  for (let i = perm.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [perm[i], perm[j]] = [perm[j], perm[i]];
  }
  return perm;
}

const DAILY_PERMUTATION = generateDailyPermutation(1337);

/**
 * Restituisce la frase del giorno (consistente per l'intera giornata)
 * Seleziona la massima tramite una permutazione pseudo-casuale deterministica
 * basata sul giorno dell'anno, garantendo massima varietà giorno per giorno
 * senza alcuna ripetizione ciclica o prevedibile.
 * @param {string} [dateStr] Data in formato 'YYYY-MM-DD'
 * @returns {string} Frase del gatto
 */
export function getDailyCatQuoteForDate(dateStr) {
  let y;
  let m;
  let d;
  if (dateStr && typeof dateStr === 'string' && dateStr.includes('-')) {
    const parts = dateStr.split('-').map(Number);
    y = parts[0];
    m = parts[1];
    d = parts[2];
  }
  if (!y || !m || !d) {
    const now = new Date();
    y = now.getFullYear();
    m = now.getMonth() + 1;
    d = now.getDate();
  }

  // Calcolo immune al cambio Ora Legale / Ora Solare tramite mezzanotte UTC pura
  const targetUtc = Date.UTC(y, m - 1, d);
  const startOfYearUtc = Date.UTC(y, 0, 1);
  const dayOfYear = Math.max(0, Math.round((targetUtc - startOfYearUtc) / 86400000));

  const permIndex = dayOfYear % DAILY_PERMUTATION.length;
  const quoteIndex = DAILY_PERMUTATION[permIndex];
  return DAILY_CAT_QUOTES[quoteIndex % DAILY_CAT_QUOTES.length];
}

/**
 * Restituisce una massima casuale tra le 365 frasi quotidiane (ideale per test e rotazione)
 * @returns {string} Frase casuale del gatto
 */
export function getRandomDailyCatQuote() {
  const randomIndex = Math.floor(Math.random() * DAILY_CAT_QUOTES.length);
  return DAILY_CAT_QUOTES[randomIndex];
}
