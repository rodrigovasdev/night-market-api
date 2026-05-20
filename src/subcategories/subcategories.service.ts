import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subcategory } from './entities/subcategory.entity';
import { Category } from '../categories/entities/category.entity';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';

@Injectable()
export class SubcategoriesService {
  constructor(
    @InjectRepository(Subcategory)
    private readonly subcategoryRepository: Repository<Subcategory>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createSubcategoryDto: CreateSubcategoryDto) {
    const { categoryId, name } = createSubcategoryDto;
    const category = await this.categoryRepository.findOneBy({ id: categoryId });
    if (!category) throw new NotFoundException(`Category with id ${categoryId} not found`);

    const subcategory = this.subcategoryRepository.create({ name, category });
    return this.subcategoryRepository.save(subcategory);
  }

  findAll() {
    return this.subcategoryRepository.find({ relations: ['category'] });
  }

  async findOne(id: number) {
    const subcategory = await this.subcategoryRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!subcategory) throw new NotFoundException(`Subcategory with id ${id} not found`);
    return subcategory;
  }

  async update(id: number, updateSubcategoryDto: UpdateSubcategoryDto) {
    const { categoryId, name } = updateSubcategoryDto;

    const subcategory = await this.findOne(id);

    if (categoryId) {
      const category = await this.categoryRepository.findOneBy({ id: categoryId });
      if (!category) throw new NotFoundException(`Category with id ${categoryId} not found`);
      subcategory.category = category;
    }

    if (name) subcategory.name = name;

    return this.subcategoryRepository.save(subcategory);
  }

  async remove(id: number) {
    const subcategory = await this.findOne(id);
    return this.subcategoryRepository.remove(subcategory);
  }
}
