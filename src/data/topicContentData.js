// Barrel file — merges all topic content into a single lookup object
import { sqlContent } from './topicContent/sqlContent';
import { sqlContent2 } from './topicContent/sqlContent2';
import { pythonContent } from './topicContent/pythonContent';
import { pythonContent2 } from './topicContent/pythonContent2';
import { dsaContent } from './topicContent/dsaContent';
import { dsaContent2 } from './topicContent/dsaContent2';
import { linuxContent } from './topicContent/linuxContent';
import { gitContent } from './topicContent/gitContent';

export const topicContentData = {
  ...sqlContent,
  ...sqlContent2,
  ...pythonContent,
  ...pythonContent2,
  ...dsaContent,
  ...dsaContent2,
  ...linuxContent,
  ...gitContent,
};
