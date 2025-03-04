import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ListService {
  constructor(private supbaseService: SupabaseService) {}

  async create(createListDto: CreateListDto[], boardId: string) {
    if (!createListDto) {
      throw new BadRequestException('No lists provided');
    }

    if (boardId) {
      const { data, error } = await this.supbaseService.supabase
        .from('board')
        .select()
        .eq('id', boardId);
      if (error) {
        throw new BadRequestException(error.message);
      }
      if (data.length === 0) {
        throw new NotFoundException('Board not found');
      }
    }
    console.log(createListDto);
    const lists = createListDto.map((list, index) => {
      return {
        title: list.title,
        boardId,
        position: index,
      };
    });

    const { data, error } = await this.supbaseService.supabase
      .from('list')
      .upsert(lists)
      .select();
    if (error) {
      throw new BadRequestException(error.message);
    }

    let listIds = data.map((list) => list.id);

    let cards = [];
    for (let i = 0; i < createListDto.length; i++) {
      for (let j = 0; j < createListDto[i].cards.length; j++) {
        cards.push({
          title: createListDto[i].cards[j].title,
          description: createListDto[i].cards[j].description,
          listId: listIds[i],
          position: j,
        });
      }
    }
    const { data: cardsData, error: cardsError } =
      await this.supbaseService.supabase.from('card').upsert(cards).select();
    if (cardsError) {
      throw new BadRequestException(cardsError.message);
    }

    console.log(cardsData);

    return data;
  }

  async findAllCardsInLists(boardId: string) {
    const { data: board, error: boardError } =
      await this.supbaseService.supabase
        .from('board')
        .select()
        .eq('id', boardId);
    if (board.length === 0) {
      throw new BadRequestException('Board not found');
    }

    const { data: lists, error } = await this.supbaseService.supabase
      .from('list')
      .select()
      .eq('boardId', boardId)
      .order('position');

    for (let list of lists) {
      const { data, error } = await this.supbaseService.supabase
        .from('card')
        .select()
        .eq('listId', list.id)
        .order('position');
      if (error) {
        throw new BadRequestException(error.message);
      }
      list.cards = data;
      for (let card of list.cards) {
        //select assigned users and board labels
        await Promise.all([
          this.getAssignedUsers(card.id),
          this.getLaBelCards(card.id),
        ]).then((results) => {
          card.assignedUsers = results[0];
          card.labels = results[1];
        });
      }
    }
    return lists;
  }

  async createNewLists(createListDto: string, boardId: string) {
    if (!createListDto) {
      throw new BadRequestException('No list provided');
    }

    let lastPosition!: number;

    if (boardId) {
      const { data, error } = await this.supbaseService.supabase
        .from('board')
        .select()
        .eq('id', boardId);
      if (error) {
        throw new BadRequestException(error.message);
      }
      if (data.length === 0) {
        throw new NotFoundException('Board not found');
      }
    }

    const { data: lists, error: listsError } =
      await this.supbaseService.supabase
        .from('list')
        .select()
        .eq('boardId', boardId)
        .order('position', { ascending: false })
        .limit(1);
    console.log(listsError);
    if (listsError) {
      throw new BadRequestException(listsError.message);
    }

    if (lists.length == 0) {
      lastPosition = 0;
    } else {
      lastPosition = lists[0].position;
    }

    console.log(createListDto);

    const list = {
      title: createListDto,
      boardId,
      position: lastPosition + 1,
    };

    const { data, error } = await this.supbaseService.supabase
      .from('list')
      .insert(list)
      .select();
    if (error) {
      throw new BadRequestException(error.message);
    }
    return data[0];
  }

  async updateLists(lists: UpdateListDto[], boardId: string) {
    if (!lists) {
      throw new BadRequestException('No lists provided');
    }

    if (boardId) {
      const { data, error } = await this.supbaseService.supabase
        .from('board')
        .select()
        .eq('id', boardId);
      if (error) {
        throw new BadRequestException(error.message);
      }
      if (data.length === 0) {
        throw new NotFoundException('Board not found');
      }
    } else {
      throw new BadRequestException('No boardId provided');
    }

    //update lists position by promise.all
    const updateLists = lists.map((list, index) => {
      return this.supbaseService.supabase
        .from('list')
        .update({ position: index })
        .eq('id', list.id)
        .select();
    });

    const results = await Promise.all(updateLists);
    const dataArray = results.flatMap((result) => result.data);
    console.log(dataArray);
    if (
      results.map((result) => result.error).filter((error) => error).length > 0
    ) {
      throw new BadRequestException('Error updating lists');
    }
    return dataArray;
  }

  async remove(id: string) {
    const { data, error } = await this.supbaseService.supabase
      .from('list')
      .delete()
      .eq('id', id)
      .select();
    if (error) {
      throw new BadRequestException(error.message);
    }

    return data[0];
  }

  async updateListCard(cardId: string, cardPosition: number, listId: string) {
    console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaa');

    const { data: card, error: cardError } = await this.supbaseService.supabase
      .from('card')
      .select()
      .eq('id', cardId)
      .single();
    if (cardError) {
      throw new BadRequestException(cardError.message);
    }

    console.log(card);
    console.log(card.listId);
    console.log(listId);

    if (card.listId != listId) {
      // get all cards in th  e list
      const { data: cards, error: cardsError } =
        await this.supbaseService.supabase
          .from('card')
          .select('id, position')
          .eq('listId', listId)
          .order('position');

      // create new card array with updated card position
      let newCards = [...cards];

      let newCard = {
        id: cardId,
        position: cardPosition,
      };

      newCards.splice(cardPosition, 0, newCard);

      console.log(newCards);

      console.log(listId);

      // update all cards with new position
      const promises = newCards.map((card, index) => {
        return this.supbaseService.supabase
          .from('card')
          .update({ position: index, listId: listId })
          .eq('id', card.id)
          .select();
      });

      const results = await Promise.all(promises);

      const dataArray = results.flatMap((result) => result.data);

      for (let card of dataArray) {
        console.log(card);
        await Promise.all([
          this.getAssignedUsers(card.id),
          this.getLaBelCards(card.id),
        ]).then((results) => {
          card.assignedUsers = results[0];
          card.labels = results[1];
          console.log(card);
        });
      }

      if (
        results.map((result) => result.error).filter((error) => error).length >
        0
      ) {
        throw new BadRequestException('Error updating lists');
      }
      console.log('cuoi', dataArray);
      return dataArray;
    } else {
      // get all cards in the list
      const { data: cards, error: cardsError } =
        await this.supbaseService.supabase
          .from('card')
          .select('id, position')
          .eq('listId', listId)
          .order('position');

      // create new card array with updated card position
      let newCard = {
        id: cardId,
        position: cardPosition,
      };

      let newCards = [...cards];

      //remove card from current position
      newCards = newCards.filter((card) => card.id !== cardId);

      console.log(newCards);

      //insert card in new position
      newCards.splice(cardPosition, 0, newCard);

      console.log(newCards);
      // update all cards with new position
      const promises = newCards.map((card, index) => {
        return this.supbaseService.supabase
          .from('card')
          .update({ position: index })
          .eq('id', card.id)
          .select();
      });
      const results = await Promise.all(promises);
      const dataArray = results.flatMap((result) => result.data);
      if (
        results.map((result) => result.error).filter((error) => error).length >
        0
      ) {
        throw new BadRequestException('Error updating lists');
      }
      await Promise.all(
        dataArray.map(async (card) => {
          await Promise.all([
            this.getAssignedUsers(card.id),
            this.getLaBelCards(card.id),
          ]).then((results) => {
            card.assignedUsers = results[0];
            card.labels = results[1];
          });
        }),
      );
      return dataArray;
    }
  }

  async getLaBelCards(cardId: string) {
    const { data, error } = await this.supbaseService.supabase
      .from('labels_cards')
      .select('boardLabelId')
      .eq('cardId', cardId);
    if (error) {
      throw new BadRequestException(error.message);
    }
    return data;
  }

  async getAssignedUsers(cardId: string) {
    const { data, error } = await this.supbaseService.supabase
      .from('user_cards')
      .select('user_id')
      .eq('card_id', cardId);
    if (error) {
      throw new BadRequestException(error.message);
    }
    return data;
  }
}
