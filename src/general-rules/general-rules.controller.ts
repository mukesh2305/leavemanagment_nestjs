import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
} from '@nestjs/common';
import { GeneralRulesService } from './general-rules.service';
import { CreateGeneralRuleDto } from './dto/create-general-rule.dto';
import { UpdateGeneralRuleDto } from './dto/update-general-rule.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FilterGeneralRulesDto } from './dto/filter-general-rules.dto';
import { validatePermission } from 'src/helper/permission.helper';

@ApiTags('General Rules')
@Controller('general-rules')
export class GeneralRulesController {
  constructor(private readonly generalRulesService: GeneralRulesService) {}

  @Post()
  @ApiBearerAuth()
  async create(
    @Body() createGeneralRuleDto: CreateGeneralRuleDto,
    @Request() req,
  ) {
    const permission = await validatePermission(req, 'CREATE_GENERAL_RULE');
    if (permission) {
      return this.generalRulesService.create(createGeneralRuleDto);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }

  @Get()
  @ApiBearerAuth()
  findAll(@Query() query: FilterGeneralRulesDto) {
    return this.generalRulesService.findAll(query);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.generalRulesService.findOne(id);
  // }

  @Patch(':id')
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Body() updateGeneralRuleDto: UpdateGeneralRuleDto,
    @Request() req,
  ) {
    const permission = await validatePermission(req, 'UPDATE_GENERAL_RULE');
    if (permission) {
      return this.generalRulesService.update(id, updateGeneralRuleDto);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }

  @Delete(':id')
  @ApiBearerAuth()
  async remove(@Param('id') id: string, @Request() req) {
    const permission = await validatePermission(req, 'DELETE_GENERAL_RULE');
    if (permission) {
      return this.generalRulesService.remove(id);
    } else {
      return {
        status: 403,
        message: 'Access Denied',
      };
    }
  }
}
