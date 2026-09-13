import {NgIconConfig} from '@ng-icons/core';

export interface NavigationRoutes {
  name: string;
  url: string;
  icon?: {
    name: string;
    config?: NgIconConfig
  }
}
