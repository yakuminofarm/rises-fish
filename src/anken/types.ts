export type Category = "promo" | "service" | "web";

export type PartyKind = "member" | "client" | "vendor";

/** 課のメンバー・社内クライアント・外注先をまとめて「相手」として扱う */
export interface Party {
  id: string;
  name: string;
  org: string;
  kind: PartyKind;
  /** アバターに表示する1文字 */
  short: string;
}

export type TaskStatus = "todo" | "doing" | "review" | "waiting" | "done";

/** テンプレート工程で、次に手を動かすのが誰側か */
export type StepSide = "us" | "client" | "vendor";

export type Priority = "both" | "important" | "urgent" | "neither";

export interface Project {
  id: string;
  title: string;
  category: Category;
  ownerId: string;
  clientId?: string;
  vendorId?: string;
  due: string;
  priority: Priority;
  createdAt: string;
  done: boolean;
  requestId?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  step?: string;
  side: StepSide;
  assigneeId: string;
  ballId: string;
  /** ボールが今の保持者に移った日 */
  ballSince: string;
  start: string;
  due: string;
  status: TaskStatus;
  order: number;
  doneAt?: string;
}

export type RequestSource = "form" | "mail" | "chatwork" | "line" | "memo";
export type RequestState = "new" | "hold" | "declined" | "converted";

export interface Request {
  id: string;
  title: string;
  fromId: string;
  source: RequestSource;
  receivedAt: string;
  desiredDue?: string;
  note?: string;
  state: RequestState;
  projectId?: string;
}

export interface Activity {
  id: string;
  projectId: string;
  taskId?: string;
  at: string;
  /** "system" はボール移動などの自動記録 */
  actorId: string;
  text: string;
}

export type HomeVariant = "A" | "B" | "C";
