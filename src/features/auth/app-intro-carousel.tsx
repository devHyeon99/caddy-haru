"use client";

import {
  BarChart3,
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useRef } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { A11y, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import * as styles from "./app-intro-carousel.css";

const slides = [
  {
    title: "하루 수입을 빠르게",
    description: "캐디피와 오버피를 빠르게 기록해요.",
    icon: CalendarCheck2,
  },
  {
    title: "수입 흐름을 한눈에",
    description: "일별·월별 수입과 올해 총수입을 한곳에서 확인해요.",
    icon: BarChart3,
  },
  {
    title: "나만의 안전한 장부",
    description: "내 수입 기록은 로그인한 계정에서만 관리할 수 있어요.",
    icon: ShieldCheck,
  },
];

export function AppIntroCarousel() {
  const swiperRef = useRef<SwiperInstance | null>(null);

  return (
    <div className={styles.region} aria-label="캐디하루 주요 기능">
      <button
        className={styles.previousButton}
        type="button"
        aria-label="이전 소개"
        onClick={() => swiperRef.current?.slidePrev()}
      >
        <ChevronLeft size={21} aria-hidden="true" />
      </button>
      <Swiper
        className={styles.carousel}
        modules={[Pagination, A11y]}
        loop
        pagination={{ clickable: true }}
        a11y={{
          enabled: true,
          slideLabelMessage: "{{index}} / {{slidesLength}}",
          paginationBulletMessage: "{{index}}번째 소개로 이동",
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
      >
        {slides.map(({ title, description, icon: Icon }) => (
          <SwiperSlide className={styles.slide} key={title}>
            <div className={styles.icon} aria-hidden="true">
              <Icon size={30} strokeWidth={2.2} />
            </div>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.description}>{description}</p>
          </SwiperSlide>
        ))}
      </Swiper>
      <button
        className={styles.nextButton}
        type="button"
        aria-label="다음 소개"
        onClick={() => swiperRef.current?.slideNext()}
      >
        <ChevronRight size={21} aria-hidden="true" />
      </button>
    </div>
  );
}
