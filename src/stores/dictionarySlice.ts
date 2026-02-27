import createBaseSlice from './baseSlice';
import { dictionaryService } from '../api/services/dictionaryService';
import type { CreateDictionaryDto, Dictionary, UpdateDictionaryDto } from '../api/types';

const dictBaseSlice = createBaseSlice<Dictionary, CreateDictionaryDto, UpdateDictionaryDto>(
  'dictionary',
  dictionaryService,
);

export const dictionarySlice = dictBaseSlice.slice;
export const dictionaryActions = dictBaseSlice.actions;
export default dictionarySlice.reducer;
