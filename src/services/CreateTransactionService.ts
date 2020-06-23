import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  categoryTitle: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    categoryTitle,
  }: Request): Promise<Transaction> {
    // TODO
    const transactionsRepository = getCustomRepository(TransactionRepository);

    if (type === 'outcome') {
      const { total } = await transactionsRepository.getBalance();

      if (total < value) throw new AppError('Insuficient balance');
    }

    const getCategoryId = async (): Promise<string> => {
      const categoryRepository = getRepository(Category);

      const category = await categoryRepository.findOne({
        where: {
          title: categoryTitle,
        },
      });

      if (category) return category.id;

      const newCategory = categoryRepository.create({ title: categoryTitle });

      await categoryRepository.save(newCategory);

      return newCategory.id;
    };
    const category_id = await getCategoryId();

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
