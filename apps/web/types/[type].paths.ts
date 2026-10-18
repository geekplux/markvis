import { TYPE_IDS, typePage } from "../src/type-pages";

export default {
  paths() {
    return TYPE_IDS.map((type) => ({ params: { type }, content: typePage(type) }));
  },
};
