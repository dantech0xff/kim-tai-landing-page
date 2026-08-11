# Content review: Vietnamese technical blog

> Superseded on 11 August 2026 by the concise four-section rewrite. Findings below apply only to the earlier long-form article; current evidence is in [reviewer-260811-1456-concise-blog-rewrite.md](./reviewer-260811-1456-concise-blog-rewrite.md).

## Verdict

**Needs minor revision before publication.** All requested architecture areas are present: the 9999 incident, server/mobile boundary, PriceTick identity, primary/fallback fetching, parser rules, scheduler/auth/concurrency/deadline behavior, unit normalization, BigInt spread gate, raw/public separation, Flutter remote/cache/manual/empty flow, world-gold boundary, operations/tests, and explicit non-goals. The global disclaimer correctly makes prices reference-only and separately reserves source-use rights.

No high-severity finding. No secret value, credential, private crawler URL, provider endorsement, guaranteed-accuracy claim, investment recommendation, or unsupported English article was found.

## Findings

### 1. Medium — `PriceTick` field names drift from the supplied contract

- JSON: `sections[id=contract-truoc-parser].blocks[1].code`, [blog.vi.json lines 112–116]
- Source: lines 80–89
- Evidence: the source's reduced `PriceTick` uses `provider_id`, `market_code`, `gold_type`, `buy_price_per_luong_vnd`, `sell_price_per_luong_vnd`, `quoted_at`, and `source_url`. The rewrite silently substitutes a camelCase DTO and changes `gold_type` to `productCode` while retaining the label `PriceTick`.
- Proposed wording: restore the source block exactly, or rename the label/type to make the abstraction explicit. Preferred code:

```ts
type PriceTick = {
  provider_id: string;
  market_code: string;
  gold_type: string;
  buy_price_per_luong_vnd: number | null;
  sell_price_per_luong_vnd: number | null;
  quoted_at: string;
  source_url: string;
};
```

### 2. Medium — Mobile cache identity changes `priceMarketCode` to `marketCode`

- JSON: `sections[id=contract-truoc-parser].blocks[3].items[1]`, line 126; `sections[id=flutter-va-cache].blocks[2].text`, line 334
- Source: lines 100–105 and 432–441
- Evidence: both source occurrences define the mobile key as `providerId::priceMarketCode::productCode`; both rewrite occurrences use `providerId::marketCode::productCode`.
- Proposed wording: replace both keys with ``providerId::priceMarketCode::productCode``. In the cache paragraph, also preserve the named ordering field: “Record có `updatedAt` mới hơn thắng; nếu quote time bằng nhau thì `fetchedAt` phá hoà.”

### 3. Medium — The privacy boundary is missing from the explicit non-goals

- JSON: `sections[id=nhung-dieu-khong-lam].blocks[1].items`, lines 448–456
- Source: lines 619–631, especially line 629
- Evidence: the source explicitly says the price backend does not receive the user's gold book, notes, or personal transactions. The rewritten non-goals preserve every adjacent security/provenance restriction but omit this privacy boundary.
- Proposed wording: add “Không tải sổ vàng, ghi chú hoặc giao dịch cá nhân lên backend giá.”

### 4. Medium — Historical incident prices need the source's explicit time context

- JSON: `sections[id=9999-khong-phai-la-gia].blocks[1–2]`, lines 51–59
- Source: lines 504–528
- Evidence: the source dates the incident to 11/07/2026, explicitly says the row is historical rather than a current price, and gives the correct contemporaneous values as 145.000.000 mua / 149.000.000 bán VND/lượng. The rewrite labels the snippet “Dữ liệu lịch sử rút gọn” but omits the date, explicit not-current warning, and correct comparison value while displaying concrete financial numbers.
- Proposed wording: before the code block, add “Trong sự cố ngày 11/07/2026, parser gặp dòng dữ liệu lịch sử dưới đây; các con số này không phải giá hiện tại.” After the block, add “Giá đúng trong dòng đó là 145.000.000 VND mua và 149.000.000 VND bán trên một lượng.”

### 5. Low — The public-view predicate sentence is semantically awkward

- JSON: `sections[id=raw-va-read-model].blocks[1].text`, line 297
- Source: lines 367–376
- Evidence: “quote vượt predicate chất lượng” can read as a quote exceeding/violating the predicate. The source says views retain quotes that satisfy the quality conditions.
- Proposed wording: “Ứng dụng không đọc trực tiếp toàn bộ bảng tick. Nó đọc public view chỉ chứa provider, market và product đang enable, cùng các quote **đạt** predicate chất lượng. View market-aware cho app mới nhận đủ khu vực mà không phá shape của contract legacy.”

### 6. Low — The rewrite makes an optional source URL sound mandatory

- JSON: `sections[id=flutter-va-cache].blocks[0].text`, line 324
- Source: lines 403–415, especially line 411
- Evidence: the source contract says the source URL, **if present**, must be canonical HTTPS. The rewrite lists a canonical HTTPS source URL without retaining that condition.
- Proposed wording: “Flutter đọc view market-aware qua Supabase REST. Repository tiếp tục kiểm tra identity, range, thứ tự buy và sell, timestamp và, nếu có, yêu cầu source URL là URL HTTPS canonical. Một row lỗi không làm crash cả snapshot; các row sạch còn lại vẫn có thể dùng, nhưng response chưa sạch không được ghi vào remote cache.”

## Publication checks with no finding

- Architecture snapshot is explicitly dated 10/08/2026; the metadata update date does not change that scope.
- Shard count/times, concurrency range, 15-second deadlines, conversion multipliers, 10–300 million guardrail, 10% spread boundary, 90-second warm cache, 90-minute/bảy-day world-gold thresholds, 37.5-gram lượng, and 0.9999 purity match the source.
- Scheduler/parser details are detailed but expose no secret values or private transport endpoints.
- Global caveat covers reference-only pricing, no investment advice, source terms, robots policy, rate limits, licensing, storage, and redistribution.
- Narrative is coherent; repetition of the incident rule and quality gate functions as recap rather than a broken loop.

## Unresolved questions

None.
