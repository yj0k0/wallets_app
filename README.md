# 出費管理アプリ (Expense Manager)

複数デバイス間で同期可能な出費管理アプリケーションです。プロジェクトごとに予算とカテゴリを管理し、リアルタイムでデータを同期できます。

## 機能

- 📊 プロジェクト別の出費管理
- 💰 カテゴリ別予算設定
- 📱 複数デバイス間でのリアルタイム同期
- 🔄 オフライン対応（ローカルバックアップ）
- 📈 支出分析とインサイト
- 🌐 プロジェクトごとのURL生成

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Firebase設定

1. [Firebase Console](https://console.firebase.google.com/) で新しいプロジェクトを作成
2. **Authentication**を有効化し、**匿名認証**をオンにする
3. **Firestore Database**を有効化
4. **セキュリティルール**を設定:

```bash
# firestore.rulesファイルの内容をコピーしてFirebase ConsoleのFirestore > ルールに貼り付け
```

5. プロジェクト設定から**Webアプリ**を追加
6. 設定値をコピーして `.env.local` ファイルを作成:

```bash
cp env.example .env.local
```

7. `.env.local` ファイルを編集してFirebase設定値を入力

**Firebase設定の詳細手順:**

1. **Authentication設定:**
   - Firebase Console → Authentication → Sign-in method
   - 「匿名」を有効化

2. **Firestore設定:**
   - Firebase Console → Firestore Database → データベースを作成
   - テストモードで開始

3. **セキュリティルール設定:**
   - Firebase Console → Firestore Database → ルール
   - `firestore.rules`ファイルの内容をコピー&ペースト

4. **Webアプリ設定:**
   - Firebase Console → プロジェクト設定 → 全般
   - 「アプリを追加」→ Webアプリ
   - 設定値をコピーして`.env.local`に貼り付け

### 3. 開発サーバーの起動

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## データ構造

### Firestore Collections

- `projects`: プロジェクト情報
- `projectData`: プロジェクトの詳細データ（カテゴリ、支出）
- `userSettings`: ユーザー設定

### ローカルストレージ

- `expense-projects`: プロジェクト一覧のバックアップ
- `expense-project-{projectId}`: 各プロジェクトのデータバックアップ
- `device-id`: デバイス識別子
- `temporary-user-id`: 一時的なユーザーID

## 技術スタック

- **フロントエンド**: Next.js 15, React 19, TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: Firebase Firestore
- **認証**: Firebase Auth (将来の拡張用)
- **UI コンポーネント**: Radix UI

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
